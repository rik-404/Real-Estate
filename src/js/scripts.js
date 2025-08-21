// Função para verificar e corrigir caminhos de imagens
function checkAndFixImagePaths() {
  console.log("Verificando caminhos de imagens...");
  
  // Seleciona todas as imagens do site
  const allImages = document.querySelectorAll('img');
  
  allImages.forEach(img => {
    const src = img.getAttribute('src');
    console.log(`Verificando imagem: ${src}`);
    
    // Verifica se a imagem está carregando corretamente
    img.onerror = function() {
      console.error(`Erro ao carregar imagem: ${src}`);
      
      // Tenta corrigir caminhos comuns
      if (src.startsWith('./src/')) {
        // Remove o ponto do início para páginas internas
        const newSrc = src.replace('./src/', '../src/');
        console.log(`Tentando corrigir caminho para: ${newSrc}`);
        img.src = newSrc;
      } else if (src.startsWith('../src/') && window.location.pathname.includes('/src/pages/')) {
        // Já está na pasta correta, não precisa do ../
        const newSrc = src.replace('../src/', '../');
        console.log(`Tentando corrigir caminho para: ${newSrc}`);
        img.src = newSrc;
      }
    };
    
    // Força a verificação da imagem
    const tempSrc = img.src;
    img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    setTimeout(() => { img.src = tempSrc; }, 10);
  });
}

// Executa a verificação quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  // Código existente
  const slides = document.querySelectorAll(".slide");

  // Coleta títulos e links diretamente do HTML
  const titles = Array.from(document.querySelectorAll(".slide-content h2")).map((title) => title.textContent);
  const links = Array.from(document.querySelectorAll(".slide-content button")).map((button) => button.dataset.link); // Obtém links do atributo data-link nos botões

  const indicators = document.querySelectorAll(".controller-nav a"); // Indicadores para atualizar classe active
  let currentIndex = 0;

  // Função para trocar os slides
  const changeSlide = () => {
    slides.forEach((slide, index) => {
      slide.style.display = index === currentIndex ? "block" : "none";

      // Atualiza título e link dinamicamente
      const slideContent = slide.querySelector(".slide-content");
      if (slideContent) {
        slideContent.querySelector("h2").textContent = titles[currentIndex];
        slideContent.querySelector("button").onclick = () => {
          window.location.href = links[currentIndex];
        };
      }
    });

    // Atualiza a classe .active nos indicadores
    indicators.forEach((indicator, index) => {
      if (index === currentIndex) {
        indicator.classList.add("active");
      } else {
        indicator.classList.remove("active");
      }
    });

    currentIndex = (currentIndex + 1) % slides.length; // Altera para o próximo slide
  };

  // Inicializa o carrossel
  setInterval(changeSlide, 5000); // Troca de slide a cada 5 segundos
  changeSlide(); // Executa na inicialização

  // Adiciona efeito de zoom no slider
  const slidesImg = document.querySelectorAll(".slide img");

  // Configura o IntersectionObserver
  const observerOptions = {
    root: null, // Usa o viewport como referência
    threshold: 0.1, // Executa o efeito quando 10% da imagem está visível
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible"); // Adiciona a classe para efeito
      } else {
        entry.target.classList.remove("visible"); // Remove a classe se sair de tela
      }
    });
  }, observerOptions);

  // Observa cada imagem
  slidesImg.forEach((img) => {
    observer.observe(img);
  });
  
  // Verifica e corrige caminhos de imagens
  checkAndFixImagePaths();
});
