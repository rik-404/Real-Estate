/**
 * Módulo para manipulação de arquivos CSV
 * Permite importar e exportar dados do sistema em formato CSV
 */

// Função para converter array de objetos para CSV
function objectsToCSV(data) {
  if (!data || !data.length) return '';
  
  // Obter cabeçalhos a partir das chaves do primeiro objeto
  const headers = Object.keys(data[0]);
  
  // Criar linha de cabeçalho
  let csvContent = headers.join(',') + '\n';
  
  // Adicionar linhas de dados
  data.forEach(item => {
    const row = headers.map(header => {
      // Obter o valor e garantir que seja uma string
      let value = item[header] !== undefined ? item[header] : '';
      
      // Converter para string se não for
      if (typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      
      // Escapar aspas e envolver em aspas se contiver vírgulas ou quebras de linha
      if (value.includes('"')) {
        value = value.replace(/"/g, '""');
      }
      
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = `"${value}"`;
      }
      
      return value;
    });
    
    csvContent += row.join(',') + '\n';
  });
  
  return csvContent;
}

// Função para converter CSV para array de objetos
function csvToObjects(csv) {
  if (!csv) return [];
  
  // Dividir por linhas
  const lines = csv.split('\n');
  if (lines.length < 2) return [];
  
  // Obter cabeçalhos
  const headers = parseCSVLine(lines[0]);
  
  // Processar linhas de dados
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Pular linhas vazias
    
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      console.warn(`Linha ${i+1} tem número incorreto de valores. Esperado: ${headers.length}, Encontrado: ${values.length}`);
      continue;
    }
    
    const obj = {};
    headers.forEach((header, index) => {
      let value = values[index];
      
      // Tentar converter para tipos apropriados
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      } else if (!isNaN(value) && value.trim() !== '') {
        // Verificar se é um número, mas não converter IDs que são numéricos
        if (!header.toLowerCase().includes('id')) {
          value = Number(value);
        }
      } else if (value.startsWith('[') || value.startsWith('{')) {
        // Tentar converter JSON
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Manter como string se falhar
        }
      }
      
      obj[header] = value;
    });
    
    result.push(obj);
  }
  
  return result;
}

// Função auxiliar para analisar uma linha CSV considerando aspas
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Verificar se é um escape de aspas duplas
      if (i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // Pular a próxima aspa
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Fim do campo
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Adicionar o último campo
  result.push(current);
  
  return result;
}

// Função para exportar dados para CSV e fazer download
function exportToCSV(data, filename) {
  const csvContent = objectsToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Função para importar dados de um arquivo CSV
function importFromCSV(file, callback) {
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const csvContent = event.target.result;
    const data = csvToObjects(csvContent);
    callback(data);
  };
  
  reader.onerror = function() {
    console.error('Erro ao ler o arquivo CSV');
    callback([]);
  };
  
  reader.readAsText(file);
}

// Função para validar dados de clientes
function validateClientData(client) {
  const requiredFields = ['name', 'email', 'phone'];
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!client[field]) {
      errors.push(`Campo obrigatório ausente: ${field}`);
    }
  });
  
  // Validar email
  if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
    errors.push('Email inválido');
  }
  
  return errors;
}

// Função para validar dados de usuários
function validateUserData(user) {
  const requiredFields = ['name', 'username', 'password', 'role'];
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!user[field]) {
      errors.push(`Campo obrigatório ausente: ${field}`);
    }
  });
  
  // Validar papel do usuário
  const validRoles = ['admin', 'corretor', 'dev'];
  if (user.role && !validRoles.includes(user.role)) {
    errors.push(`Papel inválido: ${user.role}. Deve ser um dos seguintes: ${validRoles.join(', ')}`);
  }
  
  return errors;
}

// Função para validar dados de imóveis
function validatePropertyData(property) {
  const requiredFields = ['title', 'type', 'price'];
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!property[field]) {
      errors.push(`Campo obrigatório ausente: ${field}`);
    }
  });
  
  // Validar preço
  if (property.price && isNaN(Number(property.price))) {
    errors.push('Preço deve ser um número');
  }
  
  return errors;
}

// Exportar funções
window.CSVHandler = {
  exportToCSV,
  importFromCSV,
  validateClientData,
  validateUserData,
  validatePropertyData
};
