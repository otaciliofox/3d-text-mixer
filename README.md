# 🔠 3D Text Mixer

[Português](#português) | [English](#english)

---

<a name="português"></a>
## 🇧🇷 Português

**3D Text Mixer** é uma aplicação web interativa desenvolvida para desenhar, customizar e exportar letreiros e nomes 3D em múltiplas camadas. A ferramenta é perfeitamente otimizada para gerar malhas sólidas (arquivos `.stl`), prontas para uso direto em softwares fatiadores de impressão 3D (Cura, PrusaSlicer, Bambu Studio).

### 🗺️ The Big Picture (Visão Geral)
A premissa principal deste software é eliminar a dor de cabeça de softwares CAD pesados na hora de modelar textinhos personalizados ou chaveiros de dupla cor.
O usuário possui controles em tempo real sobre:
- **Camadas de Texto**: Texto de Fundo (Grosso/Block) e Texto Frontal (Cursivo).
- **Tipografia Escalonável**: Mais de 40 fontes integradas e carregadas dinamicamente sob demanda.
- **Estruturas de Suporte (Bases)**: Geração matemática de placas traseiras ou barras inferiores.
- **Ajustes Finos (Offsets)**: Controle milimétrico de X, Y e Z para posicionar adereços, centralizar textos ou "afundar" detalhes para maior fixação estrutural no plástico.

#### 🏗️ Arquitetura do Projeto
Para garantir que o código seja legível, manutenível e amigável para desenvolvedores (desde Juniores até Seniores), foram utilizadas as metodologias de **SOLID** (especialmente Responsabilidade Única - SRP), **KISS** (Keep It Simple) e **DRY** (Don't Repeat Yourself).

O projeto é Vanilla JavaScript otimizado pelo **Vite**. Não utiliza React, Vue ou Angular, provando que é possível ter código altamente modular e moderno de forma nativa.

#### Estrutura de Pastas
```text
/
├── index.html                 # Ponto de entrada e esqueleto da interface
├── src/
│   ├── main.js                # 👑 Orquestrador: Liga os eventos do DOM (UI) ao motor 3D
│   ├── constants/             
│   │   ├── config.js          # Constantes de cor, geometria e configurações padrão
│   │   └── fonts.js           # Listas curadas do Google Fonts
│   ├── core/                  # 🧠 O Cérebro 3D (Three.js)
│   │   ├── SceneManager.js    # Cria o palco, luzes, câmera e renderizador
│   │   ├── GeometryBuilder.js # Matemática de extrusão (Letras, Formas, "Smart Gluing")
│   │   └── Exporter.js        # Lógica de download do .STL
│   ├── ui/                    # 🖱️ Lógica de Interface
│   │   └── CustomDropdown.js  # Código do menu customizado de busca de fontes
│   ├── utils/                 
│   │   ├── debounce.js        # Utilitário para evitar gargalos de performance ao arrastar sliders
│   │   └── fontLoader.js      # Fetch e parse das fontes usando OpenType.js
│   └── styles/                # 🎨 CSS Componentizado
│       ├── main.css           # Importa todos os módulos CSS
│       ├── variables.css      # Design Tokens (cores globais)
│       ├── layout.css         # Grid, Sidebar e Canvas
│       └── components/        # Estilos isolados para cada tipo de controle
```

#### 🧩 Desafios e Soluções Matemáticas

Entender o que acontece "por baixo dos panos" é essencial caso você vá criar novas funcionalidades. Aqui estão os principais desafios resolvidos na construção dessa base:

##### 1. Inversão de Eixos (SVGLoader vs Three.js)
**O Problema:** Os caminhos (Paths) das fontes extraídos pela `opentype.js` utilizam o padrão SVG (onde o Y cresce para **baixo**). Quando o `Three.js` gerava a extrusão em 3D, a letra ficava de cabeça para baixo. Além disso, a profundidade (Z) se comportava de maneira estranha.

**A Solução:** Ao gerar as geometrias no `GeometryBuilder.js`, foi aplicada uma `rotation.x = Math.PI` para virar a malha. Em seguida, houve a compensação matemática definindo `position.z = depth` para garantir que todas as peças nasçam confortavelmente de `Z = 0` até o `Z` de profundidade da peça.

#### 2. O Algoritmo de "Smart Gluing" (Letras Flutuantes)
**O Problema:** Em impressão 3D, caracteres com acentos (como `é`, `ã`, `i`) não podem ter os acentos "flutuando" no ar, caso contrário, a impressora falhará.

**A Solução:** Em `createTextMesh()`, as palavras são processadas **letra por letra** (Glyph). Se for identificado que um caractere contém 2 ou mais ilhas/malhas separadas (como a base do 'i' e seu pingo), o algoritmo automaticamente calcula a Bounding Box e aplica um "Shift Y" para **afundar e colar (glue)** as peças voadoras no topo ou fundo da letra base, usando o valor de intersecção definido pelo usuário no slider `Accent Offset`.

##### 3. Fontes Compatíveis (OpenType vs WOFF2)
**O Problema:** Houve uma tentativa de usar a API oficial do Google Fonts (`fonts.googleapis.com`), mas as requisições modernas devolviam o arquivo em `.woff2` (muito leve, porém ultra-comprimido usando Brotli). A `opentype.js` no navegador não consegue decodificá-lo.

**A Solução:** O `fontLoader.js` foi construído para bater nos CDNs independentes do **Fontsource**, que oferecem a fonte já descompactada e nativa no formato aberto `.ttf`. Foi implementado um fluxo inteligente que tenta carregar o peso '400', e se a fonte não possuir esse peso, faz *fallback* automático para '700' ou 'normal'.

### 🚀 Como Rodar e Contribuir
**Pré-requisitos:** Node.js instalado.

**Instalação:**
```bash
# Instale as dependências locais
npm install

# Inicie o servidor de desenvolvimento rápido (Vite)
npm run dev
```

**Adicionando Novas Formas:**
Se precisar adicionar mais enfeites além do coração ou estrela, basta ir em `src/core/GeometryBuilder.js` na função `createDecoration()` e desenhar os limites usando o `THREE.Shape()`. Tudo será renderizado instantaneamente!

---

<a name="english"></a>
## 🇺🇸 English

**3D Text Mixer** is an interactive web application designed to create, customize, and export layered 3D signs and names. The tool is perfectly optimized to generate solid meshes (`.stl` files), ready for direct use in 3D printing slicer software (Cura, PrusaSlicer, Bambu Studio).

### 🗺️ The Big Picture
The main premise of this software is to eliminate the headache of heavy CAD software when modeling personalized text or dual-color keychains.
The user has real-time control over:
- **Text Layers**: Background Text (Block/Bold) and Foreground Text (Cursive).
- **Scalable Typography**: More than 40 integrated fonts loaded dynamically on demand.
- **Support Structures (Bases)**: Mathematical generation of backing plates or underline bars.
- **Fine Adjustments (Offsets)**: Millimeter control of X, Y, and Z to position decorations, center texts, or "sink" details for better structural adhesion in plastic.

### 🏗️ Project Architecture
To ensure the code is readable, maintainable, and developer-friendly (from Juniors to Seniors), **SOLID** (especially Single Responsibility Principle - SRP), **KISS** (Keep It Simple), and **DRY** (Don't Repeat Yourself) methodologies were implemented.

The project is Vanilla JavaScript optimized by **Vite**. It does not use React, Vue, or Angular, proving that it is possible to have highly modular and modern code natively.

#### Folder Structure
```text
/
├── index.html                 # Entry point and interface skeleton
├── src/
│   ├── main.js                # 👑 Orchestrator: Links DOM events (UI) to the 3D engine
│   ├── constants/             
│   │   ├── config.js          # Color, geometry, and default configuration constants
│   │   └── fonts.js           # Curated lists of Google Fonts
│   ├── core/                  # 🧠 The 3D Brain (Three.js)
│   │   ├── SceneManager.js    # Creates the stage, lights, camera, and renderer
│   │   ├── GeometryBuilder.js # Extrusion logic (Letters, Shapes, "Smart Gluing")
│   │   └── Exporter.js        # STL download logic
│   ├── ui/                    # 🖱️ Interface Logic
│   │   └── CustomDropdown.js  # Custom font search dropdown code
│   ├── utils/                 
│   │   ├── debounce.js        # Utility to avoid performance bottlenecks when dragging sliders
│   │   └── fontLoader.js      # Font fetching and parsing using OpenType.js
│   └── styles/                # 🎨 Componentized CSS
│       ├── main.css           # Imports all CSS modules
│       ├── variables.css      # Design Tokens (global colors)
│       ├── layout.css         # Grid, Sidebar, and Canvas
│       └── components/        # Isolated styles for each type of control
```

### 🧩 Challenges and Mathematical Solutions

Understanding what happens "under the hood" is essential if you plan to create new features. Here are the main challenges solved during the construction of this base:

#### 1. Axis Inversion (SVGLoader vs Three.js)
**The Problem:** Font paths extracted by `opentype.js` use the SVG standard (where Y grows **downwards**). When `Three.js` generated the 3D extrusion, the letter would be upside down. Additionally, the depth (Z) behaved strangely.

**The Solution:** When generating geometries in `GeometryBuilder.js`, a `rotation.x = Math.PI` was applied to flip the mesh. This was then mathematically compensated by setting `position.z = depth` to ensure all pieces originate from `Z = 0` up to the piece's depth.

#### 2. The "Smart Gluing" Algorithm (Floating Letters)
**The Problem:** In 3D printing, characters with accents (like `é`, `ã`, `i`) cannot have the accents "floating" in the air, otherwise the printer will fail.

**The Solution:** In `createTextMesh()`, words are processed **glyph by glyph**. If a character is identified as containing 2 or more separate islands/meshes (like the base of the 'i' and its dot), the algorithm automatically calculates the Bounding Box and applies a "Y-Shift" to **sink and glue** the flying pieces to the top or bottom of the base letter, using the intersection value defined by the user in the `Accent Offset` slider.

#### 3. Compatible Fonts (OpenType vs WOFF2)
**The Problem:** There was an attempt to use the official Google Fonts API (`fonts.googleapis.com`), but modern requests returned files in `.woff2` (very light, but ultra-compressed using Brotli). `opentype.js` in the browser cannot decode it.

**The Solution:** `fontLoader.js` was built to hit independent **Fontsource** CDNs, which offer the font already decompressed and native in the open `.ttf` format. An intelligent flow was implemented to try loading the '400' weight, and if the font does not have that weight, it automatically falls back to '700' or 'normal'.

### 🚀 How to Run and Contribute
**Prerequisites:** Node.js installed.

**Installation:**
```bash
# Install local dependencies
npm install

# Start the fast development server (Vite)
npm run dev
```

**Adding New Shapes:**
If you need to add more decorations besides the heart or star, just go to `src/core/GeometryBuilder.js` in the `createDecoration()` function and draw the boundaries using `THREE.Shape()`. Everything will be rendered instantly!
