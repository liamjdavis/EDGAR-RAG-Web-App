from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig, pipeline, BitsAndBytesConfig
from langchain_huggingface import HuggingFacePipeline
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from huggingface_hub import login
import torch
import os
from dotenv import load_dotenv

def load_rag_model():
    # Load environment variables from .env file
    load_dotenv()

    # Retrieve Hugging Face token from environment variables
    hf_token = os.getenv('HF_TOKEN')
    login(hf_token)
    model_name = "meta-llama/Meta-Llama-3.1-8B-Instruct"
    
    bnb_config = BitsAndBytesConfig()

    model = AutoModelForCausalLM.from_pretrained(model_name,
                                                 device_map="auto",
                                                 config=bnb_config,
                                                 trust_remote_code=True)

    gen_cfg = GenerationConfig.from_pretrained(model_name)
    gen_cfg.max_new_tokens = 256
    gen_cfg.temperature = 0.0000001 
    gen_cfg.return_full_text = True
    gen_cfg.do_sample = True
    gen_cfg.repetition_penalty = 1.11
    
    tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)

    pipe = pipeline(
        task="text-generation",
        model=model,
        tokenizer=tokenizer,
        generation_config=gen_cfg
    )

    llm = HuggingFacePipeline(pipeline=pipe)
    
    # Prompt template
    prompt_template_llama3 = """
    <|begin_of_text|><|start_header_id|>system<|end_header_id|>

    You are an assistant for a financial analyst. Use the following context to answer the question at the end with specfic metrics
    and datapoints. Be sure to be specific in describing what you are reporting, including any necessary information to understand your response. 
    If you do not have enough information to answer the question, state that, then report similar figures. Do not make up any information. 
    For each figure, cite the statement where the figure can be found. 
    
    Return in this format:
    
    <response>
    [The text of your response]
    </response>
    
    <citation>
    [The citation in the following format: (Company, Form Type, Page Number)]
    </citation>
    
    {context}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

    {question}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
    """

    prompt_template=prompt_template_llama3

    prompt = PromptTemplate(
        input_variables=["text"],
        template=prompt_template,
    )
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

    # Load embeddings
    embedding_model_name = "sentence-transformers/all-mpnet-base-v2"

    embeddings = HuggingFaceEmbeddings(
        model_name=embedding_model_name,
    )

    vector_store = FAISS.load_local("/data", embeddings, allow_dangerous_deserialization=True)

    # RetrievalQA chain
    Chain_pdf = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vector_store.as_retriever(search_type="similarity_score_threshold", search_kwargs={'k': 5, 'score_threshold': 0.2}),
        chain_type_kwargs={"prompt": prompt},
    )
    
    print("ready for retrieval")

    return Chain_pdf
