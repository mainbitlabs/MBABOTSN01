// DIALOGO DE SERVICIO
/**
   _____ ______ _______      _______ _____ _____ ____  
  / ____|  ____|  __ \ \    / /_   _/ ____|_   _/ __ \ 
 | (___ | |__  | |__) \ \  / /  | || |      | || |  | |
  \___ \|  __| |  _  / \ \/ /   | || |      | || |  | |
  ____) | |____| | \ \  \  /   _| || |____ _| || |__| |
 |_____/|______|_|  \_\  \/   |_____\_____|_____\____/ 
                                                                                                                                                                                                 
 */
const config = require('../config');
const azurest = require('azure-storage');
const tableSvc = azurest.createTableService(config.storageA, config.accessK);
const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory, TextPrompt,AttachmentPrompt } = require('botbuilder-dialogs');

const { MailDialog, MAIL_DIALOG } = require('./MAIL');
const { OtrosDialog, OTROS_DIALOG } = require('./OTROS');
const SERVICIO_DIALOG = "SERVICIO_DIALOG";
const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const ATTACH_PROMPT = "ATTACH_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';


class ServicioDialog extends ComponentDialog {
    constructor(){
        super(SERVICIO_DIALOG);
        this.addDialog(new MailDialog());
        this.addDialog(new OtrosDialog());
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new AttachmentPrompt(ATTACH_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this),
            this.secondStep.bind(this),
            this.finalStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;

    }

    async firstStep(step) {
    console.log('[ServicioDialog]: firstStep');
    
    return await step.prompt(CHOICE_PROMPT,{
        prompt:'**Que servicio deseas solicitar**',
        choices: ChoiceFactory.toChoices(['Red/Internet', 'Correo', 'Resguardo', 'Permisos', 'Bloqueo', 'Otros'])
    });
}
async secondStep(step){
    console.log('[ServicioDialog]: secondStep');
    const level2 = step.result.value;
    const sol = config.solicitud;
    sol.level2 = level2;

    console.log(level2);
    
    switch (level2) {
        case "Red/Internet": 
        case "Correo": 
        case "Resguardo": 
        case "Permisos": 
        case "Bloqueo":
           config.solicitud.level3 = "";
           return await step.beginDialog(MAIL_DIALOG);
        case "Otros":
            return await step.beginDialog(OTROS_DIALOG);     
    }
   
}

async finalStep(step){
    if (config.solicitud.level3 === "") {
        return await step.endDialog();
    } else {
        
        console.log('[ServicioDialog]: finalStep');
            return await step.beginDialog(MAIL_DIALOG);
    }
    
}

}
module.exports.ServicioDialog = ServicioDialog;
module.exports.SERVICIO_DIALOG = SERVICIO_DIALOG;