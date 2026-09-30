import uuid
from app.core.database import SessionLocal
from app.models.user import User
from app.models.paper import ResearchPaper, PaperChunk, PaperSummary
from app.models.project import Project, ProjectPaper
from app.services.vector_store import vector_store_service

def seed():
    db = SessionLocal()
    owner = db.query(User).filter(User.email == 'researcher@researchmate.ai').first()
    if not owner:
        owner = db.query(User).first()

    print(f"Using owner: {owner.email} ({owner.id})")

    papers_data = [
        {
            'title': 'Attention Is All You Need',
            'authors': ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Lukasz Kaiser', 'Illia Polosukhin'],
            'year': 2017,
            'venue': 'NeurIPS 2017 (31st Conference on Neural Information Processing Systems)',
            'doi': '10.48550/arXiv.1706.03762',
            'pages': 15,
            'abstract': 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
            'summary': {
                'executive_summary': 'Introduced the Transformer architecture, replacing recurrent and convolutional layers entirely with multi-head self-attention mechanisms. It achieved state-of-the-art results on WMT translation tasks with superior parallelizability and reduced training time.',
                'key_findings': [
                    'Self-attention mechanisms can replace RNNs and CNNs entirely for sequence-to-sequence modeling.',
                    'Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions.',
                    'The model achieved 28.4 BLEU on English-to-German and 41.8 BLEU on English-to-French, outperforming all previous ensembles.',
                    'Training time was reduced to 3.5 days on 8 P100 GPUs, a fraction of preceding architectures.'
                ],
                'methodology': 'Stacked self-attention and point-wise, fully connected layers for both the encoder and decoder. Scaled Dot-Product Attention computes attention weights using queries, keys, and values scaled by sqrt(d_k). Multi-head attention projects queries, keys, and values h times.',
                'limitations': [
                    'Quadratic memory complexity O(N^2) with sequence length N, making long-context processing computationally expensive.',
                    'Lacks inherent sequential inductive bias, requiring explicit sinusoidal positional encodings.',
                    'High autoregressive latency during inference decoding for long token outputs.'
                ],
                'future_scope': [
                    'Sub-quadratic attention approximations (linear attention, state-space models).',
                    'Application to multimodal sequence modeling including vision, audio, and protein folding.',
                    'Hardware-accelerated attention kernels (FlashAttention) to mitigate memory bandwidth bottlenecks.'
                ]
            },
            'chunks': [
                {
                    'chunk_index': 0,
                    'section_name': 'Abstract',
                    'page_number': 1,
                    'content': 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. On the WMT 2014 English-to-German translation task, the big model achieves 28.4 BLEU, improving over the existing best results by over 2 BLEU.'
                },
                {
                    'chunk_index': 1,
                    'section_name': 'Architecture - Multi-Head Attention',
                    'page_number': 4,
                    'content': 'Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. MultiHead(Q, K, V) = Concat(head_1, ..., head_h)W^O where head_i = Attention(QW_i^Q, KW_i^K, VW_i^V). In this work we employ h = 8 parallel attention layers.'
                },
                {
                    'chunk_index': 2,
                    'section_name': 'Complexity & Self-Attention',
                    'page_number': 6,
                    'content': 'A self-attention layer connects all positions with a constant number of sequentially executed operations, whereas a recurrent layer requires O(n) sequential operations. In terms of computational complexity, self-attention layers are faster than recurrent layers when the sequence length n is smaller than the representation dimensionality d.'
                },
                {
                    'chunk_index': 3,
                    'section_name': 'Results & Evaluation',
                    'page_number': 8,
                    'content': 'On the WMT 2014 English-to-German translation task, the big transformer model outperforms the best previously reported models (including ensembles) by more than 2.0 BLEU, establishing a new state-of-the-art BLEU score of 28.4.'
                }
            ]
        },
        {
            'title': 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
            'authors': ['Patrick Lewis', 'Ethan Perez', 'Aleksandra Piktus', 'Fabio Petroni', 'Vladimir Karpukhin', 'Naman Goyal', 'Heinrich Küttler', 'Mike Lewis', 'Wen-tau Yih', 'Tim Rocktäschel', 'Sebastian Riedel', 'Douwe Kiela'],
            'year': 2020,
            'venue': 'NeurIPS 2020 (34th Conference on Neural Information Processing Systems)',
            'doi': '10.48550/arXiv.2005.11401',
            'pages': 19,
            'abstract': 'Large pre-trained language models store factual knowledge in their parameters, but their ability to access and manipulate knowledge is limited. We explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG) — models which combine pre-trained parametric and non-parametric memory for language generation.',
            'summary': {
                'executive_summary': 'Introduced the RAG framework uniting parametric pre-trained sequence-to-sequence language models with non-parametric neural dense passage retrieval. Demonstrated state-of-the-art factual grounding and significant reduction in factual hallucinations across open-domain QA.',
                'key_findings': [
                    'Combining dense vector retrieval with parametric generation outperforms pure parametric models on knowledge-intensive benchmarks.',
                    'Non-parametric memory can be updated on the fly without retraining or fine-tuning model weights.',
                    'Achieved 44.5% exact match on Open-Domain Natural Questions, outperforming competitive extractive and generative baselines.',
                    'Human evaluators found RAG generations significantly more factual, specific, and grounded than pure BART.'
                ],
                'methodology': 'RAG models use Dense Passage Retrieval (DPR) to retrieve top-k documents based on Maximum Inner Product Search (MIPS). Formulates two approaches: RAG-Sequence (uses same document for entire sequence) and RAG-Token (can select different documents per token). Generator is initialized with pre-trained BART-large.',
                'limitations': [
                    'High latency overhead introduced by document retrieval and multi-document cross-attention.',
                    'Susceptible to retrieval failures when vector queries lack dense lexical overlap.',
                    'Fixed Wikipedia non-parametric memory limits real-time streaming domain adaptation.'
                ],
                'future_scope': [
                    'End-to-end joint training of retriever and generator with feedback alignment.',
                    'Multi-hop retrieval pipelines for complex cross-document deductive reasoning.',
                    'Sub-document section-level reranking to minimize context clutter.'
                ]
            },
            'chunks': [
                {
                    'chunk_index': 0,
                    'section_name': 'Abstract',
                    'page_number': 1,
                    'content': 'We explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG) — models which combine pre-trained parametric and non-parametric memory for language generation. We introduce RAG models where the parametric memory is a pre-trained seq2seq model and the non-parametric memory is a dense vector index of Wikipedia.'
                },
                {
                    'chunk_index': 1,
                    'section_name': 'Methods - Dense Retrieval',
                    'page_number': 3,
                    'content': 'The retrieval component is based on DPR. DPR uses a bi-encoder architecture: a document encoder Bert_d that embeds passages into a d-dimensional vector, and a query encoder Bert_q that embeds the query x. The top-k documents with highest inner product are retrieved using FAISS / MIPS.'
                },
                {
                    'chunk_index': 2,
                    'section_name': 'RAG-Sequence vs RAG-Token',
                    'page_number': 4,
                    'content': 'In RAG-Sequence, the model treats the retrieved document as a single latent variable that is marginalized to generate the complete sequence. In RAG-Token, the model can draw from different latent documents at each token generation step, allowing generation to blend information from multiple retrieved sources.'
                },
                {
                    'chunk_index': 3,
                    'section_name': 'Experimental Results',
                    'page_number': 7,
                    'content': 'RAG establishes new state-of-the-art results on open-domain question answering across Natural Questions, WebQuestions, and CuratedTREC. Generated text is more factual and specific compared to parametric-only models.'
                }
            ]
        },
        {
            'title': 'DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning',
            'authors': ['DeepSeek-AI', 'Daya Guo', 'Dejian Yang', 'Haowei Zhang', 'Junxiao Song', 'Ruoyu Zhang', 'Runxin Xu', 'Qihao Zhu', 'Shirong Ma', 'Peiyi Wang'],
            'year': 2025,
            'venue': 'ArXiv Pre-print (DeepSeek Technical Report)',
            'doi': '10.48550/arXiv.2501.12948',
            'pages': 28,
            'abstract': 'We introduce our first-generation reasoning models, DeepSeek-R1-Zero and DeepSeek-R1. DeepSeek-R1-Zero, a model trained via large-scale reinforcement learning without prior supervised fine-tuning (SFT), demonstrates remarkable reasoning capabilities. DeepSeek-R1 incorporates multi-stage training and cold-start data before RL, achieving performance on par with OpenAI-o1-1217 on reasoning tasks.',
            'summary': {
                'executive_summary': 'Demonstrated that complex reasoning, self-reflection, and test-time verification can emerge naturally through pure large-scale Reinforcement Learning without extensive human-curated supervised demonstrations.',
                'key_findings': [
                    'DeepSeek-R1-Zero exhibits spontaneous emergence of self-correction, verification, and extended chain-of-thought rollouts under rule-based RL.',
                    'Achieved 79.8% Pass@1 on AIME 2024 and 97.3% on MATH-500, matching proprietary frontier models like OpenAI o1.',
                    'Introduced Group Relative Policy Optimization (GRPO) to eliminate the need for a separate critic model, slashing training compute overhead.',
                    'Distilled reasoning traces into smaller dense models (1.5B to 70B), dramatically democratizing frontier STEM problem solving.'
                ],
                'methodology': 'Rule-based reward system combining mathematical equivalence checkers and compiler execution feedback. Group Relative Policy Optimization (GRPO) samples multiple completions per prompt and computes relative advantage within the group. Employs cold-start reasoning demonstrations to eliminate language mixing.',
                'limitations': [
                    'Susceptible to readability degradation and language mixing in unconstrained conversational settings.',
                    'Lengthy inference token generation increases latency and server memory requirements.',
                    'Reward hacking observed in intermediate training checkpoints before strict format constraints.'
                ],
                'future_scope': [
                    'Multi-modal chain-of-thought verification for geometric theorem proving.',
                    'Integration with formal theorem provers (Lean 4, Isabelle) for automated mathematical discovery.',
                    'Hardware-accelerated speculative decoding to reduce high token latency.'
                ]
            },
            'chunks': [
                {
                    'chunk_index': 0,
                    'section_name': 'Abstract',
                    'page_number': 1,
                    'content': 'DeepSeek-R1-Zero demonstrates that reasoning capabilities can be incentivized through pure reinforcement learning without supervised fine-tuning. DeepSeek-R1 incorporates cold-start data and multi-stage training to achieve parity with OpenAI-o1-1217 on competitive mathematics and coding benchmarks.'
                },
                {
                    'chunk_index': 1,
                    'section_name': 'Reinforcement Learning Algorithm - GRPO',
                    'page_number': 5,
                    'content': 'To save training resources, we adopt Group Relative Policy Optimization (GRPO), which foregoes the critic model typically of the same size as the policy model. Instead, GRPO samples a group of outputs for each question, and optimizes the policy using normalized rewards within each group.'
                },
                {
                    'chunk_index': 2,
                    'section_name': 'Emergence of Self-Correction',
                    'page_number': 9,
                    'content': 'An intriguing phenomenon in DeepSeek-R1-Zero is the emergence of self-verification during training: the model learns to allocate more thinking time by re-evaluating initial premises, correcting algebraic mistakes, and exploring alternate deductive paths before outputting final answers.'
                }
            ]
        },
        {
            'title': 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
            'authors': ['Albert Gu', 'Tri Dao'],
            'year': 2023,
            'venue': 'ArXiv Pre-print / Association for Computational Linguistics',
            'doi': '10.48550/arXiv.2312.00752',
            'pages': 33,
            'abstract': 'Foundation models are almost universally based on the Transformer architecture. However, Transformers cannot scale effectively to long sequences due to quadratic time and memory complexity. We propose Mamba, a new foundation model architecture based on selective structured state space models that achieves linear-time scaling in sequence length while matching or outperforming Transformers across modalities.',
            'summary': {
                'executive_summary': 'Introduced Selective State Space Models (S6) combined with a hardware-aware parallel scan (FlashSSM). Solved the fundamental limitation of classical SSMs by allowing parameters to vary dynamically with the input, achieving 5x higher inference throughput than Transformers.',
                'key_findings': [
                    'Selective State Spaces allow models to selectively propagate or forget information based on current token context.',
                    'Hardware-aware parallel scan algorithm achieves GPU SRAM memory hierarchy efficiency similar to FlashAttention.',
                    'Achieves 5x higher generation throughput and sub-quadratic memory complexity O(N) over long sequences.',
                    'Matches or exceeds equivalent-sized Transformers (up to 3B parameters) on language modeling benchmarks.'
                ],
                'methodology': 'Incorporates time-varying parameters as functions of the input token. Uses a hardware-aware recurrent algorithm that computes selective scans in fast GPU SRAM while maintaining numerical stability through kernel fusion.',
                'limitations': [
                    'Struggles with precise associative recall tasks requiring verbatim long-context retrieval compared to full attention.',
                    'Less established ecosystem of pre-training checkpoints and fine-tuning recipes compared to Transformers.',
                    'Inductive bias favors continuous temporal signals over discrete symbolic tree structures.'
                ],
                'future_scope': [
                    'Hybrid architectures interleaving Mamba layers with periodic attention layers (Jamba, MoE).',
                    'Extension to continuous physical simulation, genomics, and ultra-long audio waveforms.',
                    'Dedicated TPU and NPU kernel optimizations for edge inference deployment.'
                ]
            },
            'chunks': [
                {
                    'chunk_index': 0,
                    'section_name': 'Abstract',
                    'page_number': 1,
                    'content': 'We propose Mamba, a new architecture based on selective state space models. By making the state space model parameters functions of the input, Mamba addresses the weakness of prior models in performing discrete content-based reasoning while maintaining linear-time scaling in sequence length.'
                },
                {
                    'chunk_index': 1,
                    'section_name': 'Selection Mechanism',
                    'page_number': 6,
                    'content': 'The primary limitation of prior structured SSMs was time-invariance: parameters A, B, C did not depend on the input. Mamba introduces a selection mechanism where Delta, B, and C are parameterized as linear projections of input x_t, enabling dynamic context-dependent filtering.'
                },
                {
                    'chunk_index': 2,
                    'section_name': 'Hardware-Aware Algorithm',
                    'page_number': 8,
                    'content': 'To prevent memory bandwidth bottlenecks, Mamba implements a fused kernel that computes the scan in fast SRAM rather than HBM, avoiding materializing the full state expansion in GPU memory and yielding substantial throughput speedups.'
                }
            ]
        }
    ]

    existing_titles = [p.title for p in db.query(ResearchPaper).all()]
    created_papers = []

    for pdata in papers_data:
        if pdata['title'] in existing_titles:
            p = db.query(ResearchPaper).filter(ResearchPaper.title == pdata['title']).first()
            created_papers.append(p)
            print(f"Existing paper: {p.title}")
            continue

        paper = ResearchPaper(
            title=pdata['title'],
            abstract=pdata['abstract'],
            authors=pdata['authors'],
            publication_year=pdata['year'],
            venue=pdata['venue'],
            doi=pdata['doi'],
            file_path=f"./uploads/seed_{uuid.uuid4().hex[:8]}.pdf",
            file_size=1024 * 1024 * 2,
            total_pages=pdata['pages'],
            total_chunks=len(pdata['chunks']),
            owner_id=owner.id
        )
        db.add(paper)
        db.flush()

        sdata = pdata['summary']
        summary = PaperSummary(
            paper_id=paper.id,
            executive_summary=sdata['executive_summary'],
            key_findings=sdata['key_findings'],
            methodology=sdata['methodology'],
            limitations=sdata['limitations'],
            future_scope=sdata['future_scope']
        )
        db.add(summary)

        chunk_dicts = []
        for cdata in pdata['chunks']:
            chunk = PaperChunk(
                paper_id=paper.id,
                chunk_index=cdata['chunk_index'],
                section_name=cdata['section_name'],
                content=cdata['content'],
                token_count=len(cdata['content'].split()),
                page_number=cdata['page_number']
            )
            db.add(chunk)
            chunk_dicts.append({
                'chunk_index': cdata['chunk_index'],
                'section_name': cdata['section_name'],
                'content': cdata['content'],
                'page_number': cdata['page_number'],
                'token_count': len(cdata['content'].split())
            })

        try:
            vector_store_service.index_paper_chunks(paper.id, chunk_dicts)
        except Exception as e:
            print(f"Vector store note: {e}")

        created_papers.append(paper)
        print(f"Created: {paper.title}")

    # Seed Project
    project = db.query(Project).filter(Project.title == 'Frontier Foundation Models & Grounded RAG Lab').first()
    if not project:
        project = Project(
            title='Frontier Foundation Models & Grounded RAG Lab',
            description='Collaborative workspace analyzing trade-offs between dense attention, state-space models, reinforcement learning reasoning, and grounded non-parametric retrieval.',
            owner_id=owner.id
        )
        db.add(project)
        db.flush()

        for p in created_papers:
            pp = ProjectPaper(project_id=project.id, paper_id=p.id)
            db.add(pp)
        print(f"Created project: {project.title}")

    db.commit()
    print("Database seeding completed!")
    db.close()

if __name__ == '__main__':
    seed()
