import os
import sys

# --- CONFIGURAÇÕES ---
# O arquivo consolidado será salvo ONDE O SCRIPT ESTÁ RODANDO (pasta do Studio)
# para facilitar a leitura pela IA depois.
ARQUIVO_SAIDA = "projeto_consolidado.txt"
NOME_SCRIPT = os.path.basename(__file__)

EXTENSOES_ALVO = (
    ".ts", ".js", ".json", ".prisma", ".env", ".md", ".yaml", ".cs", ".py", ".vue"
)

IGNORAR_PASTAS = {
    "node_modules", ".git", "dist", "build", ".vercel", "coverage", "bin", "obj", ".vs"
}

def consolidar_projeto():
    total_arquivos = 0
    
    # --- MUDANÇA PRINCIPAL AQUI ---
    # 1. Tenta pegar o caminho vindo do Studio (linha de comando)
    if len(sys.argv) > 1:
        diretorio_base = sys.argv[1]
    # 2. Se não vier, pergunta manualmente (modo interativo)
    else:
        diretorio_base = input("Digite o caminho da pasta do projeto alvo: ").strip()
        if not diretorio_base:
            diretorio_base = "." # Default para pasta atual

    # Verifica se o caminho existe
    if not os.path.exists(diretorio_base):
        print(f"❌ Erro: O diretório '{diretorio_base}' não existe.")
        return
    # -------------------------------

    print(f"🔍 Iniciando varredura em: {os.path.abspath(diretorio_base)}")

    try:
        with open(ARQUIVO_SAIDA, "w", encoding="utf-8") as saida:
            saida.write(f"CONSOLIDAÇÃO DE PROJETO: {os.path.basename(os.path.abspath(diretorio_base))}\n")
            saida.write("=" * 80 + "\n\n")

            # Agora usamos o diretorio_base no walk
            for raiz, diretorios, arquivos in os.walk(diretorio_base):
                # Filtra pastas ignoradas
                diretorios[:] = [d for d in diretorios if d not in IGNORAR_PASTAS and not d.startswith('.')]

                for arquivo in arquivos:
                    if arquivo in [NOME_SCRIPT, ARQUIVO_SAIDA, "package-lock.json"]:
                        continue
                    
                    if any(arquivo.endswith(ext) for ext in EXTENSOES_ALVO):
                        caminho_completo = os.path.join(raiz, arquivo)
                        
                        saida.write(f"\n{'='*20}\n📂 ARQUIVO: {caminho_completo}\n{'='*20}\n")
                        
                        try:
                            with open(caminho_completo, "r", encoding="utf-8") as f:
                                saida.write(f.read() + "\n")
                                total_arquivos += 1
                                # Opcional: print menos verboso para não poluir o Studio
                                # print(f"✔ Processado: {caminho_completo}")
                        except Exception as e:
                            saida.write(f"[ERRO AO LER ARQUIVO: {e}]\n")
                            print(f"✖ Erro ao ler {caminho_completo}: {e}")

        print(f"✅ SUCESSO! {total_arquivos} arquivos consolidados em '{ARQUIVO_SAIDA}'.")

    except Exception as e:
        print(f"❌ Erro fatal: {e}")

if __name__ == "__main__":
    consolidar_projeto()