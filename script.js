"use strict";


// herda da classe Error 
class ErroValidacao extends Error {
    constructor(mensagem) {
        // chama o constructor da classe pai
        super(mensagem);

        // define o nome do erro
        this.name = 'ErroValidacao';
    }
}


// Classe que guarda os dados da tarefa
class Task {
    constructor(title, description, priority) {
        this.id = Date.now()
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = 'pendente'
        this.date = new Date().toLocaleDateString('pt-BR');
    }


    concluir(){
        // se for pendente transforma em concluida e vice versa
        this.status = this.status === 'pendente' ? 'concluida' : 'pendente'
    }
}


// Classe responsalvel pelo gerenciamento, não sabe nada sobre o HMTL
class GerenciaTasks {
    constructor(){
        this.tasks = [];
    }


    cadastrar(title, description, priority){
        // croa uma nova tarefa
        let newTask = new Task(title, description, priority);
        // adiciona a tarefa na lista de tarefas
        this.tasks.push(newTask);
        return newTask;
    }


    remover(id){
        // busca o indice da tarefa
        let index = this.tasks.findIndex(t => t.id === id)

        // quando o findIndex não encontra nada ele retorna -1
        if (index !== -1){
            // remove a tarefa
            this.tasks.splice(index, 1);
        }
    }


    listar(){
        if (this.tasks.length !== 0){
            return this.tasks;
        } 
    }


    trocarStatus(id){
        let task = this.tasks.find(t => t.id === id);

        if (task){
            task.concluir();
        }
    }


    // filtra o array por status e prioridade
    filtrar(status, priority){
        // spread operator — copia o array sem modificar o original
        let resultado = [...this.tasks];

        // se o filtro de status não for 'todas', filtra pelo status
        if (status !== 'todas'){
            resultado = resultado.filter(t => t.status === status);
        }

        // se o filtro de prioridade não for 'todas', filtra pela prioridade
        if (priority !== 'todas'){
            resultado = resultado.filter(t => t.priority === priority);
        }

        return resultado;
    }
}


// Classe responsavel por gerenciar a tela, ela que vai pegar os dados
// do formulario
class GerenciaTela{

    constructor(gerenciaTasks){
        this.gerenciaTasks = gerenciaTasks;

        // guarda os elementos do html aq
        this.taskList = document.getElementById('task-list');
        this.countTotal = document.getElementById('count-total');
        this.countConcluidas = document.getElementById('count-concluidas');
        this.countPendentes = document.getElementById('count-pendentes');
        this.filtroStatus   = 'todas';
        this.filtroPriority = 'todas';
    }


    pegarDados(){
        // Pega o valor dos campos do formulario
        let title = document.getElementById('task-title').value;
        let description = document.getElementById('task-description').value;

        // querySelector pega o radio button que está marcado
        let priority = document.querySelector('input[name="priority"]:checked').value;

        return {title, description, priority};
    }


    limparFormulario(){
        // limpa os dados do formulario
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';

        // volta o radio do botao para média
        document.querySelector('input[name="priority"][value="média"]').checked = true;
    }


    renderizar(){
        this.taskList.innerHTML = '';

        // isso percorre as tasks filtradas ao invés de percorrer o array direto
        let tarefasFiltradas = this.gerenciaTasks.filtrar(this.filtroStatus, this.filtroPriority);

        // percorre cada task filtrada e cria um card para cada uma
        for(let task of tarefasFiltradas){
            this.taskList.innerHTML += this.criarCard(task);
        }

        // atualiza os contadores
        this.atualizarContadores();
    }

    
    criarCard(task){
        // switch — define a cor com base na prioridade
        let corPrioridade;

        switch (task.priority) {
            case 'EXTREMAMENTE ALTA':  corPrioridade = 'preto'; break;
            case 'alta':  corPrioridade = 'vermelho'; break;
            case 'média': corPrioridade = 'amarelo';  break;
            case 'baixa': corPrioridade = 'verde';    break;
            default:      corPrioridade = 'cinza';
        }

        return `
            <div class="card ${task.status === 'concluida' ? 'concluida' : ''}" id="card-${task.id}">
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <span class="prioridade ${corPrioridade}">${task.priority}</span>
                <p>Criada em: ${task.date}</p>
                <p>Status: <strong>${task.status}</strong></p>

                <!-- operador ternário — muda o texto do botão conforme o status -->
                <button onclick="app.toggleStatus(${task.id})">
                    ${task.status === 'pendente' ? 'Concluir' : 'Reabrir'}
                </button>

                <button onclick="app.remover(${task.id})">Remover</button>
            </div>
        `;
    }


    atualizarContadores() {
        let tasks = this.gerenciaTasks.tasks;

        let i = 0;
        let pendentes = 0;
        let concluidas = 0;
        
        // percorre o array contando concluídas e pendentes
        while(i < tasks.length){
            if(tasks[i].status === 'pendente'){ pendentes++ } else { concluidas++ } i++;
        }

        // atualiza o HTML dos contadores
        this.countTotal.innerHTML = concluidas+pendentes;
        this.countConcluidas.innerHTML = concluidas;
        this.countPendentes.innerHTML = pendentes;
    }


    mostrarErro(mensagem) {
        // exibe a mensagem de erro na tela
        let erroEl = document.querySelector('#erro-titulo');
        erroEl.innerHTML = mensagem;
        erroEl.style.display = 'block';

        // some automaticamente depois de 3 segundos
        setTimeout(() => { erroEl.style.display = 'none'; }, 3000);
    }
}



class App {
    constructor() {
        // cria as instâncias das classes
        this.gerenciaTasks = new GerenciaTasks();
        this.gerenciaTela  = new GerenciaTela(this.gerenciaTasks);

        // inicia os eventos
        this.iniciar();
    }


    iniciar() {
        document.getElementById('btn-adicionar')
            .addEventListener('click', () => this.cadastrar());

        document.getElementById('btn-limpar')
            .addEventListener('click', () => this.limparTudo());

        // evento para cada botão de filtro de status
        // querySelectorAll busca todos os elementos que combinam com o seletor e retorna uma lista.
        document.querySelectorAll('button[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('button[data-filter]').forEach(b => b.classList.remove('ativo'));
                btn.classList.add('ativo');
                this.gerenciaTela.filtroStatus = btn.dataset.filter;
                this.gerenciaTela.renderizar();
            });
        });

        // ativa o botão "todas" por padrão
        document.querySelector('button[data-filter="todas"]')?.classList.add('ativo');
        document.querySelector('button[data-priority="todas"]')?.classList.add('ativo');

        // evento para cada botão de filtro de prioridade
        document.querySelectorAll('button[data-priority]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('button[data-priority]').forEach(b => b.classList.remove('ativo'));
                btn.classList.add('ativo');
                this.gerenciaTela.filtroPriority = btn.dataset.priority;
                this.gerenciaTela.renderizar();
            });
        });
    }


    cadastrar() {
        // pega os dados do formulário via GerenciaTela
        const { title, description, priority } = this.gerenciaTela.pegarDados();

        try {
            // valida os dados
            this.validar(title, description);

            // cadastra a tarefa no GerenciaTasks
            this.gerenciaTasks.cadastrar(title, description, priority);

            // atualiza a tela
            this.gerenciaTela.renderizar();

            // limpa o formulário
            this.gerenciaTela.limparFormulario();

        } catch (erro) {
            // exibe o erro na tela
            this.gerenciaTela.mostrarErro(erro.message);
        }
    }


    validar(title, description) {
        if (!title || title.trim() === '') {
            throw new ErroValidacao('O título não pode estar vazio.');
        }
        if (title.length < 3) {
            throw new ErroValidacao('O título deve ter pelo menos 3 caracteres.');
        }
        if (!description || description.trim() === '') {
            throw new ErroValidacao('A descrição não pode estar vazia.');
        }
    }


    toggleStatus(id) {
        // troca o status da tarefa
        this.gerenciaTasks.trocarStatus(id);
        // atualiza a tela
        this.gerenciaTela.renderizar();
    }


    remover(id) {
        // remove a tarefa
        this.gerenciaTasks.remover(id);
        // atualiza a tela
        this.gerenciaTela.renderizar();
    }


    limparTudo() {
        // esvazia o array
        this.gerenciaTasks.tasks = [];
        // atualiza a tela
        this.gerenciaTela.renderizar();
    }
}

// inicia o app — global para os botões dos cards funcionarem
const app = new App();

app.gerenciaTasks.cadastrar('CRIAR CSS', 'FAZER O MAUMAU CRIAR O CSS - TAREFA EXTREMAMENTE COMPLICADA - ELE NÃO SAI DO CS-GO', 'EXTREMAMENTE ALTA')
app.gerenciaTasks.cadastrar('SE ESQUIVAR DO RAYA', 'RAYA POSSUI O NARIZ MUITO GRANDE, MUITO CUIDADO PARA NÃO SER NOCAUTEADO', 'EXTREMAMENTE ALTA')
app.gerenciaTela.renderizar()