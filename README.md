# EDGAR RAG
EDGAR RAG (Retrieval-Augmented Generation) is a web interface designed to efficiently retrieve and present data from SEC filings, specifically the 10-Q and 10-K forms available through the EDGAR database. The application leverages a RAG fine-tuned on Microsoft Phi-3.5 Mini to provide accurate and contextually relevant information from these financial documents.

## Features
- Advanced Search: Quickly retrieve relevant data from 10-Q and 10-K filings using a powerful search engine backed by a vector database.
- Contextual Answers: The RAG model generates precise answers based on the context provided in SEC filings, reducing the need to manually sift through documents.
- User-Friendly Interface: The web interface is designed for ease of use, allowing users to input queries and get results with minimal effort.
- Citations: Each response has a citation at the end that includes company, form type, and page number.

## Architecture
The architecture of the EDGAR RAG application consists of several key components:

- Frontend: Built using Next.js, the frontend provides a responsive and interactive interface for users to query SEC filings.
- Backend: The FastAPI backend handles requests from the frontend, interacts with the vector database, and communicates with the RAG model to generate responses.
- Postgres Database: Handles user authentication and stores previous threads + chats

## Demo
[Here](https://youtu.be/o2st_zpSYvY) is a live video demo.

## Note on RAG accuracy
The metrics outputed by the RAG are in no way guaranteed to be accurate. Every metric and datapoint should be checked against the citation.