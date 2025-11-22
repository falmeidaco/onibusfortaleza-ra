
# 🚌 Paradas RA - Pontos de ônibus e Realidade Aumentada

Este projeto é uma aplicação web de  **Realidade Aumentada (RA)**  baseada em geolocalização. O objetivo é permitir que usuários em Fortaleza, Ceará, visualizem as paradas de ônibus mais próximas sobrepostas à imagem da câmera do dispositivo móvel, facilitando a orientação urbana.

## 📝 Sobre o Projeto

Esta aplicação foi desenvolvida como entrega do  **Projeto Final do Curso de Realidade Aumentada**.

A ferramenta utiliza a posição GPS do usuário para renderizar marcadores virtuais no mundo real, indicando a direção e a distância das paradas de ônibus cadastradas.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando tecnologias web padrão (HTML/JS) e as seguintes bibliotecas específicas para RA e manipulação 3D:

-   [**A-Frame**](https://aframe.io/ "null")**:**  Framework web para construção de experiências de realidade virtual e aumentada.
    
-   [**AR.js / Location-based AR**](https://ar-js-org.github.io/AR.js-Docs/ "null")**:**  (Base para funcionalidades de RA na Web).
    

## 📊 Fonte de Dados

Os dados geográficos referentes às localizações das paradas de ônibus foram obtidos através do portal de dados abertos da Prefeitura de Fortaleza:

-   **Fonte:**  [Fortaleza Dados Abertos](http://dados.fortaleza.ce.gov.br/ "null")
    

_Nota: Os dados foram processados e reconstruídos em um banco de dados MySQL personalizado. Foi construída uma API simples em PHP para retornar as informações relacionadas à localização do usuários (pontos de ônibus dentro de um raio de valor personalizado, relacionado às coordenadas do dispositivo do usuário)._


## 📱 Uso

1.  Abra a aplicação no navegador do seu celular pelo link [onibusfortaleza-ra.netlify.app](https://onibusfortaleza-ra.netlify.app/)
    
2.  Permita o acesso à  **Câmera**  e à  **Localização**  quando solicitado.
    
3.  Aguarde a calibração do GPS.
    
4.  Aponte a câmera para o horizonte e procure pelos marcadores das paradas de ônibus.
   

Desenvolvido por Felipe Almeida