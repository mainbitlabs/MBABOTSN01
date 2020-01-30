const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
var config = require('../config');
const azurest = require('azure-storage');
const tableSvc = azurest.createTableService(config.storageA, config.accessK);
const azureTS = require('azure-table-storage-async');

// Dialogos
const { FallaDialog, FALLA_DIALOG } = require('./FALLA');
const { PeticionDialog, PETICION_DIALOG } = require('./PETICION');
const { GeneralDialog, GENERAL_DIALOG } = require('./GENERAL');

const { ChoiceFactory, ChoicePrompt, ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog, ListStyle} = require('botbuilder-dialogs');

const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const WATERFALL_DIALOG = "WATERFALL_DIALOG";

class MainDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'mainDialog');

        this.addDialog(new FallaDialog());
        this.addDialog(new PeticionDialog());
        this.addDialog(new GeneralDialog());
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.serieStep.bind(this),
            this.infoConfirmStep.bind(this),
            this.dispatcher.bind(this),
            this.choiceDialog.bind(this),
            this.finalDialog.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;
    }

async serieStep(step){
    console.log('[mainDialog]:serieStep');
    
    await step.context.sendActivity('Recuerda que este bot tiene un tiempo limite de 10 minutos.');
    return await step.prompt(TEXT_PROMPT, `Por favor, **escribe el Número de Serie del equipo.**`);
}

async infoConfirmStep(step) {
    console.log('[mainDialog]:infoConfirmStep <<inicia>>');
    step.values.serie = step.result;
    const parkey = step.values.asociado;
    const rowkey = step.values.serie;
    // console.log(step.values);
    const query = new azurest.TableQuery().where('RowKey eq ?', rowkey);
    const result = await azureTS.queryCustomAsync(tableSvc,config.table1, query);
    // console.log("_RESULT_QUERY",result);
    if (result[0] == undefined) {  
        console.log('[mainDialog]:infoConfirmStep <<request fail>>', rowkey);
        
        await step.context.sendActivity(`La serie **${step.values.serie}** no se encontró en la base de datos, verifica la información y vuelve a intentarlo nuevamente.`); 
        return await step.endDialog();
    } else {
        console.log('[mainDialog]:infoConfirmStep <<success>>',config.marca);
        console.log('[mainDialog]:infoConfirmStep <<success>>',config.casm);
        
        for (let r of result) {
            // const result = await azureTS.retrieveEntityAsync(tableSvc,config.table1, parkey, rowkey);
            config.proyecto = "Policia Federal";
            config.casm = r.CASM._;
            config.tipo = r.TIPO._; 
            config.modelo = r.MODELO._; 
            config.marca = r.PartitionKey._; //MARCA
            config.serie = r.RowKey._; //SERIE
            config.usuario = r.NOMBRE._;
            config.inmueble = r.INMUEBLE._;
            config.direccion = r.DIRECCIONES._;
            config.estado = r.ESTADO._;
            config.telefono = r.TELEFONO._;
            config.ext = r.EXT._;
            config.perfil = r.PERFIL._;

            const msg=(`**Proyecto:** ${config.proyecto}\n\n **Modelo**: ${config.modelo} \n\n **Número de Serie**: ${config.serie} \n\n  **Nombre:** ${config.usuario} \n\n **Marca:** ${config.marca}  \n\n  **Dirección:** ${config.direccion} \n\n  **Inmueble:** ${config.inmueble} \n\n  **Teléfono:** ${config.telefono} \n\n **Extensión**: ${config.ext} `);
            await step.context.sendActivity(msg);
            return await step.prompt(CHOICE_PROMPT, {
                prompt: '**¿Esta información es correcta?**',
                choices: ChoiceFactory.toChoices(['Sí', 'No'])
            });
            
            }    
    }
}

async dispatcher(step) {
    console.log('[mainDialog]:dispatcher <<inicia>>');
    const selection = step.result.value;
    switch (selection) {
        
        case 'Sí':
            return await step.prompt(CHOICE_PROMPT,{
                prompt:'¿Tu solicitud es un requerimiento, una falla o servicio general?',
                choices: ChoiceFactory.toChoices(['Requerimiento', 'Falla', 'General'])
            });
        case 'No':
            return await step.context.sendActivity('Se envía notificación a oficina central para la validación de la información');             
                 
        default:
            break;
    }
}

    async choiceDialog(step) {
        console.log('[mainDialog]:choiceDialog <<inicia>>');
        
        const answer = step.result.value;
        config.solicitud = {};
        const sol = config.solicitud;
        
        if (!answer) {
            // exhausted attempts and no selection, start over
            await step.context.sendActivity('Not a valid option. We\'ll restart the dialog ' +
                'so you can try again!');
            return await step.endDialog();
        }
        if (answer ==='Requerimiento') {
            sol.level1 = answer;
            return await step.beginDialog(PETICION_DIALOG);
            
        } 
        if (answer ==='General') {
            sol.level1 = answer;
            return await step.beginDialog(GENERAL_DIALOG);
            
        } 
        if (answer ==='Falla') {
            sol.level1 = answer;
            return await step.beginDialog(FALLA_DIALOG);
            
        } 
        console.log('[mainDialog]:choiceDialog<<termina>>');
        return await step.endDialog();
    
    }

    async finalDialog(step){
        console.log('[mainDialog]: finalDialog');
    return await step.endDialog();
    
    }
}

module.exports.MainDialog = MainDialog;