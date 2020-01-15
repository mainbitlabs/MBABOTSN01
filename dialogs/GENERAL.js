const config = require('../config');

const azurest = require('azure-storage');
const image2base64 = require('image-to-base64');
const blobService = azurest.createBlobService(config.storageA,config.accessK);
const tableSvc = azurest.createTableService(config.storageA, config.accessK);
const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory, TextPrompt,AttachmentPrompt } = require('botbuilder-dialogs');

const GENERAL_DIALOG = "GENERAL_DIALOG";
const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const ATTACH_PROMPT = "ATTACH_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';


class GeneralDialog extends ComponentDialog {
    constructor(){
        super(GENERAL_DIALOG);
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new AttachmentPrompt(ATTACH_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this),
            this.horarioStep.bind(this),
            this.peticionStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;

    }

    async firstStep(step) {
    console.log('[GeneralDialog]: firstStep');
    
   
    return await step.prompt(CHOICE_PROMPT,{
        prompt:'**Que servicio general deseas solicitar**',
        choices: ChoiceFactory.toChoices(['Red/Internet', 'Correo', 'Carpeta compartida', 'Permisos', 'Bloqueo de cuenta'])
    });
}

async horarioStep(step){
    console.log('[GeneralDialog]: horarioDialog');
    
    const peticion = step.result.value;
    const sol = config.solicitud;
    sol.peticion = peticion;
    console.log(config.solicitud);
    return await step.prompt(TEXT_PROMPT, 'Nos indicas el **día**, **horario** y tu **celular** para realizar la atención.');
}
async peticionStep(step){
    console.log('[GeneralDialog]: peticionDialog');
    
    const date = step.result;
    const sol = config.solicitud;
    sol.date = date;
    console.log(config.solicitud);
    
    await step.context.sendActivity(`Gracias por tu apoyo, tu atención se estará dando seguimiento \n\n Tu solicitud fue: ${config.solicitud.tipo} de ${config.solicitud.peticion} \n\n Tu horario de atención será: ${config.solicitud.date}`);
    return await step.endDialog();

}


    

}
module.exports.GeneralDialog = GeneralDialog;
module.exports.GENERAL_DIALOG = GENERAL_DIALOG;