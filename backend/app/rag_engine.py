import os
import json
import chromadb
import google.generativeai as genai
from firecrawl import FirecrawlApp
from sentence_transformers import SentenceTransformer
from app.scraper_catalog import scrape_catalog
from dotenv import load_dotenv

load_dotenv()

# API Configuration
GENAI_KEY = os.getenv("GOOGLE_API_KEY")
FIRECRAWL_KEY = os.getenv("FIRECRAWL_API_KEY")

if GENAI_KEY:
    genai.configure(api_key=GENAI_KEY)

firecrawl = FirecrawlApp(api_key=FIRECRAWL_KEY) if FIRECRAWL_KEY else None

class RAGEngine:
    """
    Retrieval-Augmented Generation Engine for SHL Assessments
    
    Pipeline:
    1. URL Detection → FireCrawl scraping (if URL provided)
    2. Query Balancing → Gemini extracts hard + soft skills
    3. Vector Search → ChromaDB retrieves similar assessments
    4. Result Balancing → Ensures mix of technical + behavioral tests
    """
    
    def __init__(self):
        print("🔧 Initializing RAG Engine...")
        
        # Ensure data exists
        scrape_catalog()
        
        # IMPROVED: Persistent ChromaDB (survives restarts)
        self.chroma_client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.chroma_client.get_or_create_collection(
            name="shl_assessments",
            metadata={"hnsw:space": "cosine"}  # Cosine similarity for text
        )
        
        # Embedding model (384-dimensional vectors)
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Index data if collection is empty
        if self.collection.count() == 0:
            self._index_data()
        else:
            print(f"✅ Loaded {self.collection.count()} assessments from ChromaDB")
    
    
    def _index_data(self):
        """Index scraped assessments into vector database"""
        print("🧠 Indexing assessments into ChromaDB...")
        
        with open("data/assessments.json", "r") as f:
            data = json.load(f)
        
        # Create rich text representation for embedding
        documents = []
        for item in data:
            doc = f"{item['name']} {item['description']} {' '.join(item['test_type'])}"
            documents.append(doc)
        
        # Generate embeddings
        embeddings = self.embedder.encode(documents, show_progress_bar=True).tolist()
        
        # Store in ChromaDB
        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=data,
            ids=[str(i) for i in range(len(data))]
        )
        
        print(f"✅ Indexed {len(data)} assessments")
    
    
    def process_query(self, user_input: str):
        """
        Main recommendation pipeline
        
        Args:
            user_input: Natural language query or URL
        
        Returns:
            List of recommended assessments (dicts)
        """
        # Step 1: Handle URL inputs via FireCrawl
        search_text = user_input
        
        if user_input.startswith("http"):
            print("🕷 URL detected. Scraping with FireCrawl...")
            search_text = self._scrape_url(user_input)
        
        # Step 2: Balance query (extract hard + soft skills)
        balanced_query = self._balance_query(search_text)
        
        # Step 3: Vector search
        query_embedding = self.embedder.encode([balanced_query]).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=20  # Get more, then filter
        )
        
        # Step 4: Convert to list of dicts
        recommendations = []
        if results['metadatas']:
            for meta in results['metadatas'][0]:
                recommendations.append(meta)
        
        # Step 5: Balance results (ensure hard/soft skill mix)
        balanced_results = self._balance_results(recommendations, target_count=10)
        
        return balanced_results
    
    
    def _scrape_url(self, url: str) -> str:
        """Scrape job description from URL using FireCrawl"""
        if not firecrawl:
            print("⚠ FireCrawl API key missing. Using URL as-is.")
            return url
        
        try:
            result = firecrawl.scrape_url(url, params={'formats': ['markdown']})
            markdown_text = result.get('markdown', '')
            
            if markdown_text:
                print(f"✅ Scraped {len(markdown_text)} characters from URL")
                return markdown_text[:3000]  # Limit context window
            else:
                print("⚠ FireCrawl returned empty content")
                return url
        
        except Exception as e:
            print(f"❌ FireCrawl error: {e}")
            return url
    
    
    def _balance_query(self, text: str) -> str:
        """
        Use Gemini to extract and balance hard + soft skills from query
        
        This ensures we search for both technical and behavioral assessments
        """
        if not GENAI_KEY:
            print("⚠ Gemini API key missing. Skipping query balancing.")
            return text
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
You are an expert HR assessment analyst. Analyze this job requirement:
"{text[:1500]}"

Extract the key requirements in TWO categories:
1. HARD SKILLS: Technical abilities, tools, programming languages, certifications, domain knowledge
2. SOFT SKILLS: Personality traits, teamwork, leadership, communication, behavioral competencies

Create a balanced search query that gives EQUAL weight to both categories.
Format: "Technical: [list key hard skills] AND Behavioral: [list key soft skills]"

Example Output: "Technical: Java, SQL, API development AND Behavioral: team collaboration, stakeholder management"

If only one category is present, still structure the output the same way.
"""
        
        try:
            response = model.generate_content(prompt)
            balanced = response.text.strip()
            print(f"🎯 Balanced Query: {balanced[:100]}...")
            return balanced
        
        except Exception as e:
            print(f"❌ Gemini error: {e}")
            return text
    
    
    def _balance_results(self, results: list, target_count: int = 10) -> list:
        """
        CRITICAL REQUIREMENT: Balance recommendations across test types
        
        When a query spans multiple domains (e.g., "Java developer who collaborates well"),
        results should include BOTH:
        - Knowledge & Skills (technical tests)
        - Personality & Behavior (soft skill tests)
        
        This prevents returning only technical tests for technical roles.
        """
        # Categorize results
        knowledge_tests = []
        personality_tests = []
        other_tests = []
        
        for r in results:
            test_types = r.get('test_type', [])
            
            if "Knowledge & Skills" in test_types or "Cognitive Ability" in test_types:
                knowledge_tests.append(r)
            elif "Personality & Behavior" in test_types:
                personality_tests.append(r)
            else:
                other_tests.append(r)
        
        # If we have both types, create balanced mix
        if knowledge_tests and personality_tests:
            # 50-50 split
            half = target_count // 2
            balanced = knowledge_tests[:half] + personality_tests[:half]
            
            # Fill remaining slots
            remaining = target_count - len(balanced)
            if remaining > 0:
                balanced.extend(other_tests[:remaining])
            
            print(f"⚖ Balanced: {len(knowledge_tests[:half])} technical + {len(personality_tests[:half])} behavioral")
            return balanced[:target_count]
        
        # Otherwise, return top results
        return results[:target_count]
