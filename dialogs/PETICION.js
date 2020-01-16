const config = require('../config');

const azurest = require('azure-storage');
const image2base64 = require('image-to-base64');
const blobService = azurest.createBlobService(config.storageA,config.accessK);
const tableSvc = azurest.createTableService(config.storageA, config.accessK);
const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory, TextPrompt,AttachmentPrompt } = require('botbuilder-dialogs');

const PETICION_DIALOG = "PETICION_DIALOG";
const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const ATTACH_PROMPT = "ATTACH_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';


class PeticionDialog extends ComponentDialog {
    constructor(){
        super(PETICION_DIALOG);
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
    console.log('[PeticionDialog]: firstStep');
    
   
    return await step.prompt(CHOICE_PROMPT,{
        prompt:'**Que petición deseas realizar**',
        choices: ChoiceFactory.toChoices(['Aplicativo', 'Periferico', 'Alta de red', 'Resguardo'])
    });
}

async horarioStep(step){
    console.log('[peticion]: horarioDialog');
    
    const peticion = step.result.value;
    const sol = config.solicitud;
    sol.peticion = peticion;
    console.log(config.solicitud);
    return await step.prompt(TEXT_PROMPT, 'Nos indicas el **día**, **horario** y tu **celular** para realizar la atención.');
}
async peticionStep(step){
    console.log('[peticion]: peticionDialog');
    
    const date = step.result;
    const sol = config.solicitud;
    sol.date = date;
    console.log(config.solicitud);
    
    await step.context.sendActivity(`**Gracias por tu apoyo, tu solicitud fue la siguiente:**\n\n ‣${config.solicitud.tipo} de ${config.solicitud.peticion} \n\n **Tu horario de atención será:**\n\n ‣${config.solicitud.date}`);
    return await step.endDialog();

}


    

}
module.exports.PeticionDialog = PeticionDialog;
module.exports.PETICION_DIALOG = PETICION_DIALOG;