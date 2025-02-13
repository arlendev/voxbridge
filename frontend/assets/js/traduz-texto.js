document.addEventListener("DOMContentLoaded", () => {
  const textareaFrom = document.querySelector("#textareaFrom");
  const textareaTo = document.querySelector("#textareaTo");
  const btnTraduzir = document.querySelector("#btnTraduzir");
  const selectFrom = document.querySelector("#langSelect"); // Idioma de entrada
  const selectTo = document.querySelector("#selectTo"); // Idioma de saída

  const countries = {
    "en-GB": "Inglês",
    "es-ES": "Espanhol",
    "it-IT": "Italiano",
    "ja-JP": "Japonês",
    "pt-BR": "Português",
    "fr-FR": "Francês",
  };

  // Preencher o seletor de saída com idiomas suportados
  Object.entries(countries).forEach(([key, name]) => {
    const isSelected = key === "fr-FR" ? "selected" : "";
    const option = `<option value="${key}" ${isSelected}>${name}</option>`;
    selectTo.insertAdjacentHTML("beforeend", option);
  });

  // Evento de clique para tradução
  btnTraduzir.addEventListener("click", () => {
    const inputLang = selectFrom.value; // Idioma de entrada selecionado
    const outputLang = selectTo.value; // Idioma de saída selecionado

    // Verifica se os idiomas de entrada e saída são iguais
    if (inputLang === outputLang) {
      textareaTo.value = "Por favor, selecione um idioma de saída diferente.";
      return;
    }

    // Verifica se há texto na entrada
    const text = textareaFrom.value.trim();
    if (!text) {
      textareaTo.value = "";
      return;
    }

    // Chama a tradução com divisão do texto
    translateLongText(text, inputLang, outputLang);
  });

  // Função para dividir texto em blocos de 500 caracteres
  function splitTextIntoChunks(text, chunkSize = 500) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
  }

  // Função para traduzir texto longo
  function translateLongText(text, inputLang, outputLang) {
    const textChunks = splitTextIntoChunks(text, 500);
    let translatedText = "";

    const translateChunk = (index) => {
      if (index >= textChunks.length) {
        textareaTo.value = translatedText.trim(); // Exibe a tradução completa
        return;
      }

      fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textChunks[index])}&langpair=${inputLang}|${outputLang}`
      )
        .then((res) => res.json())
        .then((data) => {
          translatedText += data.responseData.translatedText + " ";
          translateChunk(index + 1); // Chama a próxima parte
        })
        .catch((error) => {
          console.error("Erro na tradução:", error);
          textareaTo.value = "Erro ao tentar traduzir. Tente novamente mais tarde.";
        });
    };

    translateChunk(0);
  }
});
