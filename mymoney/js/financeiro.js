// Função auxiliar: Avança os meses corretamente (virando o ano se precisar)
function calcularProximoMes(mesAnoBase, mesesAdicionais) {
    let [ano, mes] = mesAnoBase.split('-').map(Number);
    mes += mesesAdicionais;
    while (mes > 12) {
        mes -= 12;
        ano++;
    }
    return `${ano}-${mes.toString().padStart(2, '0')}`;
}

// Função para editar o nome do cartão
async function editarNomeCartao(cartaoId, nomeAtual) {
    const novoNome = prompt("Renomear Cartão:", nomeAtual);
    if (!novoNome || novoNome.trim() === '' || novoNome === nomeAtual) return;
    
    try {
        const { error } = await supabaseClient.from('cartoes').update({ nome: novoNome.trim() }).eq('id', cartaoId);
        if (error) throw error;
        alert("Cartão renomeado com sucesso!");
        // carregarCartoes(); // Descomente quando tiver a função de carregar a tela pronta
    } catch (err) {
        alert("Erro ao renomear: " + err.message);
    }
}

// Motor que salva a compra e gera as parcelas automáticas
async function salvarCompra() {
    const cartaoId = document.getElementById('compra-cartao').value;
    const descricao = document.getElementById('compra-desc').value.trim();
    const valorCompra = parseFloat(document.getElementById('compra-valor').value);
    const mesInicial = document.getElementById('compra-mes').value; // Formato YYYY-MM
    const qtdParcelas = parseInt(document.getElementById('compra-parcelas').value) || 1;

    if (!cartaoId || !descricao || isNaN(valorCompra) || !mesInicial) {
        return alert("Preencha todos os dados da compra.");
    }

    if (qtdParcelas > 1) {
        const confirmar = confirm(`Deseja que o sistema lance automaticamente as ${qtdParcelas} parcelas nos meses seguintes?`);
        if (!confirmar) return; 
    }

    const valorParcela = valorCompra / qtdParcelas; 
    let parcelasParaSalvar = [];

    // Laço que cria as parcelas
    for (let i = 1; i <= qtdParcelas; i++) {
        const mesDestino = calcularProximoMes(mesInicial, i - 1);
        let descFinal = qtdParcelas > 1 ? `${descricao} (${i}/${qtdParcelas})` : descricao;

        parcelasParaSalvar.push({
            cartao_id: cartaoId,
            descricao: descFinal,
            valor: valorParcela,
            mes_referencia: mesDestino
        });
    }

    try {
        // Envia todas as parcelas juntas para o banco
        const { error } = await supabaseClient.from('despesas').insert(parcelasParaSalvar);
        if (error) throw error;
        
        alert("Compra registrada com sucesso!");
        document.getElementById('form-compra').reset();
    } catch (err) {
        alert("Erro ao salvar compra: " + err.message);
    }
}
