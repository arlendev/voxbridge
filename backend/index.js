const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" })); // Suporte para textos longos

const filePath = './dados.json'; // Caminho do arquivo JSON

// Função para garantir que o arquivo JSON existe
function verificarArquivoJSON() {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
}

// Rota para adicionar uma nova nota
app.post('/notas', (req, res) => {
  const { nome_paciente, data_sessao, nota, traducao } = req.body;

  if (!nome_paciente || !data_sessao || !nota) {
      return res.status(400).json({ erro: 'Nome do paciente, data da sessão e nota são obrigatórios.' });
  }

  verificarArquivoJSON(); // Certifica que o arquivo JSON existe

  fs.readFile(filePath, (err, data) => {
      let notas = [];

      if (!err) {
          try {
              notas = JSON.parse(data);
          } catch (error) {
              console.error('Erro ao processar o JSON:', error);
              return res.status(500).json({ erro: 'Erro ao processar os dados.' });
          }
      }

      // Garantindo que a tradução seja salva corretamente
      const novaNota = { 
          id: notas.length + 1, 
          nome_paciente, 
          data_sessao, 
          nota,
          traducao: traducao ? traducao : "Tradução não fornecida" // Verifica se existe tradução
      };

      console.log("🔹 Salvando no backend:", JSON.stringify(novaNota, null, 2)); // Debug para verificar os dados antes de salvar

      notas.push(novaNota);

      fs.writeFile(filePath, JSON.stringify(notas, null, 2), (err) => {
        if (err) {
            console.error('Erro ao salvar a nota:', err);
            return res.status(500).json({ erro: 'Erro ao salvar a nota.' });
        }
    
        console.log("✅ Nota salva com sucesso no JSON:", JSON.stringify(notas, null, 2)); // Debug para garantir que foi salvo
        res.status(201).json({ mensagem: 'Nota adicionada com sucesso!' });
    });
    
  });
});

// Rota para listar todas as notas
app.get('/notas', (req, res) => {
    verificarArquivoJSON();

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Erro ao ler arquivo:', err);
            return res.status(500).json({ erro: 'Erro ao buscar notas.' });
        }

        try {
            const notas = JSON.parse(data);
            res.status(200).json(notas);
        } catch (error) {
            console.error('Erro ao processar o JSON:', error);
            res.status(500).json({ erro: 'Erro ao processar os dados.' });
        }
    });
});

// Rota para buscar notas de um paciente específico
app.get('/notas/:nome_paciente', (req, res) => {
    const { nome_paciente } = req.params;
    verificarArquivoJSON();

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Erro ao ler arquivo:', err);
            return res.status(500).json({ erro: 'Erro ao buscar notas.' });
        }

        try {
            const notas = JSON.parse(data);
            const resultado = notas.filter(nota => nota.nome_paciente.toLowerCase() === nome_paciente.toLowerCase());
            res.status(200).json(resultado);
        } catch (error) {
            console.error('Erro ao processar o JSON:', error);
            res.status(500).json({ erro: 'Erro ao processar os dados.' });
        }
    });
});

// Início do servidor
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    verificarArquivoJSON(); // Garante que o JSON está pronto ao iniciar o servidor
});
