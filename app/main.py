from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Trading Journal API running"}

@app.get("/health")
def health():
    return {"status": "ok"}
