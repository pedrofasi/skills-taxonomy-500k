
# Skill Taxonomy 500k

Este projeto realiza uma **taxonomia hierárquica de habilidades (skills)** baseada em um dataset com mais de **500 mil registros**, utilizando técnicas avançadas de NLP, redução de dimensionalidade e clustering.

## 🚀 Tecnologias e Etapas

- **Embedding:** BERT (Transformers)
- **Redução de Dimensionalidade:** UMAP
- **Clusterização:** HDBSCAN
- **Visualização:** JSONs com layouts preparados para D3.js ou Plotly
- **Armazenamento:** Arquivos `.npy`, `.joblib`, `.pkl` e `.json`

## 📁 Estrutura de Arquivos

| Arquivo/Pasta | Descrição |
|---------------|-----------|
| `vetores_embeddings.npy` | Vetores de embedding extraídos do BERT |
| `umap_*.pkl` | Reduções UMAP em diferentes níveis |
| `hdbscan_*.pkl` | Modelos HDBSCAN treinados |
| `clusters_*.joblib` | Clusters resultantes |
| `visualizacao_*.json` | Dados de visualização |
| `modelo_bert_skills/` | 🚫 Ignorado no Git (arquivo >2GB) — disponível separadamente |

## 📦 Como utilizar

Clone o repositório e execute os notebooks:

```bash
git clone https://github.com/pedrofasi/skill-taxonomy-500k.git
```

## ⚠️ 

A pasta modelo_bert_skills/ não está no repositório por conta do tamanho. Link externo de download.

## 🧠 Autor
Pedro Henrique Reis Rodrigues

