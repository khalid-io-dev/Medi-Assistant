# app/mlops/evaluation.py

from deepeval.test_case import LLMTestCase
from app.mlops.deepeval import DeepEvalOllamaLLM
from app.utils.logger import logger
from deepeval.metrics import (
    AnswerRelevancyMetric,
    FaithfulnessMetric,
    ContextualPrecisionMetric,
    ContextualRecallMetric,
)


def evaluate_rag(query: str, response: str, context: list):
    """
    Evaluate RAG performance using DeepEval metrics.
    """
    metrics = {
        "answer_relevance": 0.0,
        "faithfulness": 0.0,
        "precision_at_k": 0.0,
        "recall_at_k": 0.0,
    }
    
    try:
        test_case = LLMTestCase(
            input=query,
            actual_output=response,
            retrieval_context=context,
            # expected_output=expected_answer   
        )

        ollama_llm = DeepEvalOllamaLLM()
        
        # Answer Relevancy
        try:
            answer_relevance = AnswerRelevancyMetric(model=ollama_llm)
            answer_relevance.measure(test_case)
            metrics["answer_relevance"] = answer_relevance.score
            logger.info(f"☑️☑️🟢🟢 Answer Relevancy: {answer_relevance.score} ☑️")
        except Exception as e:
            logger.warning(f"🔔🔔🟡🟡AnswerRelevancy failed: {e}🟡🔔")

        # Faithfulness
        try:
            faithfulness = FaithfulnessMetric(model=ollama_llm)
            faithfulness.measure(test_case)
            metrics["faithfulness"] = faithfulness.score
            logger.info(f"☑️☑️🟢🟢 Faithfulness: {faithfulness.score} ☑️")
        except Exception as e:
            logger.warning(f"🔔🔔🟡🟡Faithfulness failed: {e}🟡🟡🔔🔔")
            
        # Precision@k 
        try:
            precision_metric = ContextualPrecisionMetric(model=ollama_llm)
            precision_metric.measure(test_case)
            metrics["precision_at_k"] = precision_metric.score
            logger.info(f"☑️☑️🟢🟢 Precision@k: {precision_metric.score} ☑️")
        except Exception as e:
            logger.warning(f"🔔🔔🟡🟡 Precision@k failed: {e} 🟡🟡🔔🔔")
            
        
        # Recall@k
        try:
            recall_metric = ContextualRecallMetric(model=ollama_llm)
            recall_metric.measure(test_case)
            metrics["recall_at_k"] = recall_metric.score
            logger.info(f"☑️☑️🟢🟢 Recall@k: {recall_metric.score} ☑️")
        except Exception as e:
            logger.warning(f"Recall@k failed: {e}")

    except Exception as e:
        logger.error(f" Evaluation failed: {e} ")
    
    return metrics