console.log("✅ Script reconhece-voz.js carregado!");

// Seletores dos elementos
const nomePaciente = document.querySelector("#nomePaciente");
const dataSessao = document.querySelector("#dataSessao");
const textArea = document.querySelector("#textareaFrom");
const outputArea = document.querySelector("#textareaTo");
const btnGravar = document.querySelector("#btnGravar");
const btnParar = document.querySelector("#btnParar");
const btnSalvar = document.querySelector("#btnSalvar");
const btnLimpar = document.querySelector("#btnLimpar");
const btnBuscar = document.querySelector("#btnBuscar");
const langSelect = document.querySelector("#langSelect");

// Verifica se todos os elementos foram encontrados
if (![nomePaciente, dataSessao, textArea, outputArea, btnGravar, btnParar, btnSalvar, btnLimpar, btnBuscar, langSelect].every(Boolean)) {
    console.error("❌ Erro: Um ou mais elementos não foram encontrados no DOM!");
} else {
    console.log("✅ Todos os elementos foram encontrados com sucesso.");
}

// Verifica se o navegador suporta reconhecimento de voz
const SpeechToText = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechToText) {
    console.error("❌ Erro: Reconhecimento de voz não é suportado neste navegador!");
    alert("Seu navegador não suporta reconhecimento de voz. Por favor, use o Google Chrome.");
}

// Classe de reconhecimento de voz
class speechApi {
    constructor() {
        if (!SpeechToText) return;
        this.speechApi = new SpeechToText();
        this.speechApi.continuous = true;
        this.speechApi.lang = "pt-BR";

        this.speechApi.onresult = (event) => {
            const transcript = event.results[event.resultIndex][0].transcript;
            console.log("🎤 Texto reconhecido:", transcript);
            textArea.value += transcript;
        };

        this.speechApi.onerror = (event) => {
            console.error("❌ Erro no reconhecimento de voz:", event.error);
            alert("Erro ao acessar o microfone. Verifique as permissões.");
        };
    }

    setLanguage(language) {
        if (this.speechApi) this.speechApi.lang = language;
    }

    start() {
        try {
            this.speechApi.start();
            console.log("🚀 Reconhecimento de voz iniciado...");
        } catch (error) {
            console.error("❌ Erro ao iniciar o reconhecimento de voz:", error);
        }
    }

    stop() {
        try {
            this.speechApi.stop();
            console.log("⏹ Reconhecimento de voz interrompido.");
        } catch (error) {
            console.error("❌ Erro ao parar o reconhecimento de voz:", error);
        }
    }
}

// Instância da classe de reconhecimento de voz
const speech = SpeechToText ? new speechApi() : null;

// Validação do nome e da data
nomePaciente.addEventListener("input", validarCampos);
dataSessao.addEventListener("input", validarCampos);

function validarCampos() {
    btnGravar.disabled = nomePaciente.value.trim() === "" || dataSessao.value.trim() === "";
}

// Evento de clique no botão Gravar
btnGravar.addEventListener("click", () => {
    if (!speech) {
        alert("Reconhecimento de voz não está disponível neste navegador.");
        return;
    }

    if (nomePaciente.value.trim() === "" || dataSessao.value.trim() === "") {
        alert("Por favor, insira o nome do paciente e a data da sessão antes de gravar.");
        return;
    }

    speech.setLanguage(langSelect.value);
    speech.start();
    btnGravar.disabled = true;
    btnParar.disabled = false;
});

// Evento de clique no botão Parar
btnParar.addEventListener("click", () => {
    if (!speech) return;
    speech.stop();
    btnGravar.disabled = false;
    btnParar.disabled = true;
});

// Evento de clique no botão Salvar
btnSalvar.addEventListener("click", () => {
    const nome = nomePaciente.value.trim();
    const data = dataSessao.value.trim();
    const nota = textArea.value.trim();
    const traducao = outputArea.value.trim();

    if (!nome || !data || !nota) {
        alert("Preencha todos os campos antes de salvar!");
        return;
    }

    const dados = { 
        nome_paciente: nome, 
        data_sessao: data, 
        nota, 
        traducao: traducao || "Tradução não fornecida"
    };

    console.log("📤 Enviando dados para o backend:", JSON.stringify(dados, null, 2));

    fetch("https://voxbridge-backend.onrender.com/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        alert("✅ Nota salva com sucesso!");
        console.log("✅ Resposta do servidor:", data);
    })
    .catch(error => {
        console.error("❌ Erro ao salvar nota:", error);
        alert("Erro ao salvar a nota.");
    });
});

// Evento de clique no botão Limpar
btnLimpar.addEventListener("click", () => {
    nomePaciente.value = "";
    dataSessao.value = "";
    textArea.value = "";
    outputArea.value = "";

    btnGravar.disabled = true;
    alert("🧹 Todos os campos foram limpos!");
});

// Função para buscar notas de um paciente e oferecer opção de download
function buscarNotas() {
    const nomePaciente = prompt("🔎 Digite o nome do paciente para buscar as notas:");

    if (!nomePaciente) {
        alert("❌ Nome do paciente não pode estar vazio!");
        return;
    }

    console.log(`📤 Buscando notas para: ${nomePaciente}`);

    fetch(`https://voxbridge-backend.onrender.com/notas/${encodeURIComponent(nomePaciente)}`)
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro ao buscar notas.");
        }
        return response.json();
    })
    .then(dados => {
        console.log("✅ Notas encontradas:", dados);

        if (dados.length === 0) {
            alert("ℹ Nenhuma nota encontrada para esse paciente.");
            return;
        }

        let notasTexto = `📌 Notas de ${nomePaciente}:\n\n`;
        dados.forEach(nota => {
            notasTexto += `📅 Data: ${nota.data_sessao}\n📝 Nota: ${nota.nota}\n🌍 Tradução: ${nota.traducao || "Nenhuma tradução disponível"}\n\n`;
        });

        // Exibir as notas no alert()
        alert(notasTexto);

        // Perguntar se deseja baixar o relatório
        if (confirm("📥 Deseja baixar o relatório como arquivo de texto?")) {
            baixarRelatorio(nomePaciente, dados);
        }
    })
    .catch(error => {
        console.error("❌ Erro ao buscar notas:", error);
        alert("❌ Erro ao carregar os dados. Tente novamente mais tarde.");
    });
}

// Função para baixar relatório como .txt
function baixarRelatorio(nomePaciente, notas) {
    let conteudo = `📌 Relatório de Notas - Paciente: ${nomePaciente}\n\n`;

    notas.forEach(nota => {
        conteudo += `📅 Data: ${nota.data_sessao}\n📝 Nota: ${nota.nota}\n🌍 Tradução: ${nota.traducao || "Nenhuma tradução disponível"}\n\n`;
    });

    const blob = new Blob([conteudo], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Relatorio_${nomePaciente}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Adiciona evento ao botão de busca
document.addEventListener("DOMContentLoaded", () => {
    if (btnBuscar) {
        btnBuscar.addEventListener("click", buscarNotas);
    }
});
