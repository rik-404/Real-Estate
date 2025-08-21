// Script para corrigir caminhos de imagens em todo o site

document.addEventListener("DOMContentLoaded", function() {
  console.log("Iniciando correção de caminhos de imagens...");
  
  // Determina a localização atual da página
  const isInRoot = window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/');
  const isInPages = window.location.pathname.includes('/src/pages/');
  const isInAdmin = window.location.pathname.includes('/admin/');
  const isInPropertyDetail = window.location.pathname.includes('/property-detail.html');
  
  console.log(`Localização da página: ${window.location.pathname}`);
  console.log(`Na raiz: ${isInRoot}, Em páginas: ${isInPages}, Em admin: ${isInAdmin}, Em detalhes: ${isInPropertyDetail}`);
  
  // Corrige todas as imagens na página
  const allImages = document.querySelectorAll('img');
  
  allImages.forEach(img => {
    const originalSrc = img.getAttribute('src');
    let newSrc = originalSrc;
    
    console.log(`Verificando imagem: ${originalSrc}`);
    
    // Corrige caminhos com base na localização da página
    if (isInRoot) {
      // Na página inicial, os caminhos devem começar com ./src/
      if (originalSrc.startsWith('../src/')) {
        newSrc = originalSrc.replace('../src/', './src/');
      }
    } else if (isInPages) {
      // Em páginas internas, os caminhos para src devem começar com ../
      if (originalSrc.startsWith('./src/')) {
        newSrc = originalSrc.replace('./src/', '../');
      } else if (originalSrc.startsWith('/src/')) {
        newSrc = originalSrc.replace('/src/', '../');
      }
    } else if (isInAdmin) {
      // Na área admin, os caminhos devem começar com ../src/
      if (originalSrc.startsWith('./src/')) {
        newSrc = originalSrc.replace('./src/', '../src/');
      } else if (originalSrc.startsWith('/src/')) {
        newSrc = originalSrc.replace('/src/', '../src/');
      }
    } else if (isInPropertyDetail) {
      // Na página de detalhes, os caminhos devem começar com ./src/
      if (originalSrc.startsWith('../src/')) {
        newSrc = originalSrc.replace('../src/', './src/');
      }
    }
    
    // Atualiza o src se foi modificado
    if (newSrc !== originalSrc) {
      console.log(`Corrigindo caminho de ${originalSrc} para ${newSrc}`);
      img.src = newSrc;
    }
    
    // Adiciona tratamento de erro para tentar caminhos alternativos
    img.onerror = function() {
      console.error(`Erro ao carregar imagem: ${img.src}`);
      
      // Tenta caminhos alternativos
      if (img.src.includes('/src/imgs/')) {
        // Tenta diferentes variações do caminho
        const alternativePaths = [
          img.src.replace('/src/imgs/', './src/imgs/'),
          img.src.replace('/src/imgs/', '../src/imgs/'),
          img.src.replace('/src/imgs/', '../imgs/'),
          img.src.replace('/src/imgs/', '../../src/imgs/')
        ];
        
        // Tenta cada caminho alternativo
        tryAlternativePaths(img, alternativePaths, 0);
      }
    };
  });
  
  // Função para tentar caminhos alternativos
  function tryAlternativePaths(imgElement, paths, index) {
    if (index >= paths.length) {
      console.error(`Não foi possível carregar a imagem após tentar todos os caminhos alternativos`);
      return;
    }
    
    console.log(`Tentando caminho alternativo: ${paths[index]}`);
    imgElement.src = paths[index];
    
    // Se ainda falhar, tenta o próximo caminho
    imgElement.onerror = function() {
      tryAlternativePaths(imgElement, paths, index + 1);
    };
  }
  
  // Corrige também os backgrounds de CSS que possam ter imagens
  fixCssBackgroundImages();
});

// Função para corrigir imagens de fundo no CSS
function fixCssBackgroundImages() {
  // Implementação futura se necessário
  console.log("Verificação de imagens de fundo CSS será implementada se necessário");
}
