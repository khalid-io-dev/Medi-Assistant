from typing import List
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import CommaSeparatedListOutputParser
from app.core.config import settings
from app.utils.logger import logger

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

class QueryExpander:

    # !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    def __init__(self):
        self.llm = ChatOllama(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.OLLAMA_MODEL,
            temperature=settings.LLM_TEMPERATURE,
        )
        self.output_parser = CommaSeparatedListOutputParser()
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "En tant qu'expert médical, reformulez la requête clinique de l'utilisateur en 3 variations distinctes et pertinentes pour améliorer la recherche documentaire. "
                       "Chaque variation doit utiliser une terminologie médicale alternative ou des concepts liés. "
                       "Répondez uniquement par les 3 reformulations séparées par des virgules."),
            ("human", "{query}")
        ])
        
        self.chain = self.prompt | self.llm | self.output_parser

    # !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    def expand_query(self, query: str) -> List[str]:
        """
        Prend une requête clinique et retourne une liste contenant la requête originale 
        ainsi que 3 variations générées par le LLM.
        """
        try:
            logger.info(f"☑️☑️ 🔍 Expanding query: {query}☑️")
            variations = self.chain.invoke({"query": query})
            
            variations = [v.strip() for v in variations if v.strip()][:settings.QUERY_EXPANSION_COUNT]
            
            expanded_queries = [query] + variations
            logger.info(f"☑️☑️ ✅ Expanded into {len(expanded_queries)} variations: {expanded_queries}☑️")
            
            return expanded_queries
        except Exception as e:
            logger.error(f"⛔⛔ ❌ Error during query expansion: {e}⛔")
            return [query]

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

query_expander = QueryExpander()

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
def expand_clinical_query(query: str) -> List[str]:
    return query_expander.expand_query(query)
