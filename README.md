[README.md](https://github.com/user-attachments/files/26392877/README.md)
# 📦 Unisoc SPD Pac Extractor

<div align="center">

![Unisoc SPD Pac Extractor](https://img.shields.io/badge/Unisoc-SPD%20Pac%20Extractor-8a0880?style=for-the-badge&logo=electron&logoColor=white)
![Versão](https://img.shields.io/badge/versão-1.0.0-green?style=for-the-badge)
![Licença](https://img.shields.io/badge/licença-MIT-blue?style=for-the-badge)
![Plataforma](https://img.shields.io/badge/plataforma-Windows%20%7C%20Linux-lightgrey?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-28-47848F?style=for-the-badge&logo=electron&logoColor=white)

**Ferramenta desktop para extrair arquivos de firmware `.PAC` da Unisoc/Spreadtrum**

[⬇️ Download Windows](#-download) · [⬇️ Download Linux](#-download) · [📖 Como usar](#-como-usar) · [🤝 Contribuir](#-contribuindo)

</div>

---

## 📌 Sobre o projeto

Este projeto nasceu como um **estudo pessoal** e evoluiu para uma ferramenta real de auxílio à comunidade de desenvolvedores que trabalha com dispositivos **Unisoc/Spreadtrum**.

O formato `.PAC` é o padrão de firmware utilizado pela Unisoc em seus chips — presente em milhares de dispositivos Android de baixo e médio custo. Porém, a Unisoc **não disponibiliza publicamente** muita documentação ou ferramentas para manipular esse formato, o que dificulta o trabalho de devs, modders e entusiastas.

Este aplicativo **reúne o conhecimento de diversos repositórios da comunidade** e oferece uma interface gráfica amigável para extrair as partições contidas dentro de um arquivo `.PAC`, sem precisar usar linha de comando.

> ⚠️ **Importante:** Atualmente a ferramenta suporta apenas **extração**. O reempacotamento ainda não foi implementado — a Unisoc não libera informações suficientes sobre a estrutura interna do formato para que isso seja feito de forma confiável. Quem sabe em breve! 🚀

---

## ✨ Funcionalidades

- 📂 Seleção visual de arquivos `.PAC`
- 📋 Listagem das partições contidas no firmware
- ⚡ Extração rápida com barra de progresso em tempo real
- 🖥️ Log detalhado do processo de extração
- 🐍 Detecção automática do Python instalado no sistema
- 🎨 Interface moderna com suporte a janela customizada (sem barra nativa)
- 🪟 Windows e 🐧 Linux suportados

---

## 📥 Download

| Plataforma | Link |
|-----------|------|
| 🪟 Windows (instalador `.exe`) | [Google Drive](https://drive.google.com/file/d/1Lwmxir7vVKxIWXwlVoGdowEPPESFJGa0/view?usp=sharing) |
| 🐧 Linux (`.tar.gz`) | [Google Drive](https://drive.google.com/file/d/1QBDa5bFV91mv5jDFg8dF646vNJ1sLvjb/view?usp=sharing) |

---

## 🛠️ Pré-requisitos

Antes de usar o aplicativo, você precisa ter o **Python** instalado:

### Windows
1. Acesse [python.org/downloads](https://www.python.org/downloads/)
2. Baixe o **Python 3.14** (ou a versão mais recente disponível)
3. ✅ **Marque a opção "Add Python to PATH"** durante a instalação

> ⚠️ **O aplicativo requer Python 3.14 ou superior no Windows.** Versões antigas podem não funcionar corretamente com o script de extração.

### Linux
O Python já vem instalado na maioria das distros. Caso não tenha:
```bash
sudo apt install python3   # Ubuntu/Debian
sudo dnf install python3   # Fedora
sudo pacman -S python      # Arch
```

---

## 📖 Como usar

### Windows
1. Baixe e execute o instalador `.exe`
2. Abra o **Unisoc SPD Pac Extractor**
3. Clique em **"Selecionar arquivo .PAC"**
4. Escolha o arquivo de firmware `.pac`
5. Clique em **"Extrair PAC"**
6. Os arquivos serão extraídos na mesma pasta do `.PAC`, dentro de uma subpasta `extracted_nomedoarquivo/`

### Linux
1. Baixe o arquivo `.tar.gz`
2. Extraia:
```bash
tar -xzf "Unisoc SPD Pac Tool-1.0.0.tar.gz"
cd "Unisoc SPD Pac Tool-1.0.0"
./unisoc-spd-pac-tool
```

---

## 🏗️ Rodando em modo desenvolvimento

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/unisoc-spd-pac-tool.git
cd unisoc-spd-pac-tool

# Instale as dependências
npm install

# Inicie o app em modo de teste
npm start
```

### Build

```bash
npm run build        # Build para a plataforma atual
npm run build:win    # Build para Windows (.exe)
npm run build:linux  # Build para Linux (.tar.gz)
```

> 💡 **Dica:** Antes de buildar, certifique-se de que todas as dependências estão instaladas com `npm install`.

> ⚠️ **Build Linux no Windows:** O build para Linux precisa ser feito em uma máquina Linux ou via WSL2. No Windows, use `wsl --install` para instalar o WSL2 e rode `npm run build:linux` dentro dele.

---

## 🧱 Tecnologias utilizadas

| Tecnologia | Uso |
|-----------|-----|
| [Electron](https://www.electronjs.org/) | Framework desktop |
| [Python](https://www.python.org/) | Motor de extração do `.PAC` |
| HTML / CSS / JS | Interface do usuário |
| [electron-builder](https://www.electron.build/) | Geração dos instaladores |
| Font Awesome | Ícones da interface |

---

## 📂 Estrutura do projeto

```
unisoc-spd-pac-tool/
├── main.js          # Processo principal (Electron)
├── preload.js       # Bridge segura entre main e renderer
├── renderer.js      # Lógica da interface
├── index.html       # Estrutura da UI
├── style.css        # Estilos
├── extractor.py     # Script Python de extração do PAC
└── package.json     # Configurações e build
```

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Este projeto é **open source** e existe para ajudar a comunidade Unisoc.

Se você:
- Encontrou uma forma de **reempacotar** arquivos `.PAC`
- Tem conhecimento sobre a **estrutura interna** do formato
- Quer melhorar a interface ou adicionar funcionalidades

Fique à vontade para abrir uma **Issue** ou enviar um **Pull Request**!

```bash
# Fork o projeto
# Crie sua branch
git checkout -b feature/minha-feature

# Commit suas mudanças
git commit -m "feat: minha nova feature"

# Push
git push origin feature/minha-feature

# Abra um Pull Request
```

---

## ⚠️ Aviso

Este projeto é destinado a **fins educacionais e de desenvolvimento**. Use com responsabilidade e respeite os termos de uso dos dispositivos e firmwares com os quais trabalhar.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---

<div align="center">

Feito com ❤️ para a comunidade Unisoc/Spreadtrum

⭐ Se este projeto te ajudou, deixa uma estrela no repositório!

</div>
