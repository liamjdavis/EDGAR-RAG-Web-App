from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig, pipeline, BitsAndBytesConfig
from langchain_huggingface import HuggingFacePipeline
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

def load_rag_model():
    model_name = "meta-llama/Meta-Llama-3.1-8B-Instruct"
    
    bnb_config = BitsAndBytesConfig()

    model = AutoModelForCausalLM.from_pretrained(model_name,
                                                 device_map="auto",
                                                 config=bnb_config,
                                                 trust_remote_code=True)

    tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)

    gen_cfg = GenerationConfig.from_pretrained(model_name)
    gen_cfg.max_new_tokens = 512
    gen_cfg.temperature = 0.0000001 
    gen_cfg.return_full_text = True
    gen_cfg.do_sample = True
    gen_cfg.repetition_penalty = 1.11

    pipe = pipeline(
        task="text-generation",
        model=model,
        tokenizer=tokenizer,
        generation_config=gen_cfg
    )

    llm = HuggingFacePipeline(pipeline=pipe)

    # Load embeddings
    embedding_model_name = "sentence-transformers/all-mpnet-base-v2"
    
    embeddings = HuggingFaceEmbeddings(
        model_name=embedding_model_name,
        multi_process=True,
    )

    vector_store = FAISS.load_local("vector_db", embeddings, allow_dangerous_deserialization=True)

    # Prompt template
    prompt_template_llama3 = """
    system

    Use the following context to answer the question at the end. Report anything that remotely resembles what the question is asking. 
    Be sure to be specific in describing what you are reporting. If you do not have enough information to answer the 
    question, state that, then report similar figures. Cite the statements you use in your response by company and form type.

    {context}assistant

    {question}assistant
    """

    prompt = PromptTemplate(template=prompt_template_llama3, input_variables=["context", "question"])

    # RetrievalQA chain
    Chain_pdf = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vector_store.as_retriever(search_type="similarity_score_threshold", search_kwargs={'k': 5, 'score_threshold': 0.2}),
        chain_type_kwargs={"prompt": prompt},
    )

    return Chain_pdf
