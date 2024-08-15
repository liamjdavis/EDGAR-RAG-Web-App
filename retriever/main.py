from huggingface_hub import login, notebook_login
from langchain_huggingface import HuggingFacePipeline
from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig, pipeline, BitsAndBytesConfig, AutoConfig
import torch
from textwrap import fill
from langchain.prompts import PromptTemplate
import locale
from langchain.document_loaders import UnstructuredURLLoader
from langchain.vectorstores.utils import filter_complex_metadata
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# load llama 3.1
locale.getpreferredencoding = lambda: "UTF-8"
from huggingface_hub import login, notebook_login
login("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")

model_name = "meta-llama/Meta-Llama-3.1-8B-Instruct" 

bnb_config = BitsAndBytesConfig()

model = AutoModelForCausalLM.from_pretrained(model_name,
                                             device_map="auto",
                                             config=bnb_config,
                                             trust_remote_code=True)

tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)

gen_cfg = GenerationConfig.from_pretrained(model_name)
gen_cfg.max_new_tokens=512
gen_cfg.temperature=0.0000001 
gen_cfg.return_full_text=True
gen_cfg.do_sample=True
gen_cfg.repetition_penalty=1.11

pipe=pipeline(
    task="text-generation",
    model=model,
    tokenizer=tokenizer,
    generation_config=gen_cfg
)

llm = HuggingFacePipeline(pipeline=pipe)

# load embeddings
embedding_model_name = "sentence-transformers/all-mpnet-base-v2"

embeddings = HuggingFaceEmbeddings(
    model_name=embedding_model_name,
    multi_process=True,
)

vector_store = FAISS.load_local("vector_db", embeddings, allow_dangerous_deserialization=True)

# prompt template
prompt_template_llama3 = """
<|begin_of_text|><|start_header_id|>system<|end_header_id|>

Use the following context to answer the question at the end. Report anything that remotely resembles what the question is asking. 
Be sure to be specific in describing what you are reporting. If you do not have enough information to answer the 
question, state that, then report similar figures. Cite the statements you use in your response by company and form type.

{context}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

{question}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""

prompt_template=prompt_template_llama3

prompt = PromptTemplate(
    input_variables=["text"],
    template=prompt_template,
)
prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])

# retrieval chain
from langchain.chains import RetrievalQA

Chain_pdf = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(search_type="similarity_score_threshold", search_kwargs={'k': 5, 'score_threshold': 0.2}),
    chain_type_kwargs={"prompt": prompt},
)

class Query(BaseModel):
    question: str

@app.get("/ping")
async def ping():
    return {"message": "pong"}

@app.post("/retrieve")
async def retrieve(query: Query):
    try:
        # Use your RetrievalQA chain to get the answer
        result = Chain_pdf({"context": "", "question": query.question})
        return {"answer": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)   