const config = require('../config');
const azurest = require('azure-storage');
const tableSvc = azurest.createTableService(config.storageA, config.accessK);
const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory, TextPrompt,AttachmentPrompt } = require('botbuilder-dialogs');

const { MailDialog, MAIL_DIALOG } = require('./MAIL');
const GENERAL_DIALOG = "GENERAL_DIALOG";
const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const ATTACH_PROMPT = "ATTACH_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';


class GeneralDialog extends ComponentDialog {
    constructor(){
        super(GENERAL_DIALOG);
        this.addDialog(new MailDialog());
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new AttachmentPrompt(ATTACH_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this),
            this.fechaStep.bind(this),
            this.horarioStep.bind(this),
            this.telefonoStep.bind(this),
            this.correoStep.bind(this),
            this.finalStep.bind(this)
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
async fechaStep(step){
    console.log('[GeneralDialog]: fechaStep');
    
    const level2 = step.result.value;
    const sol = config.solicitud;
    sol.level2 = level2;
    sol.level3 = "";
    // console.log(config.solicitud);
    return await step.prompt(TEXT_PROMPT, 'Indica **día y mes** (DD/MM),para realizar la atención.');
}
async horarioStep(step){
    console.log('[peticion]: horarioDialog');
    const fecha = step.result;
    config.atencion = {};
    const att = config.atencion;
    att.fecha = fecha;

    return await step.prompt(CHOICE_PROMPT,{
        prompt:'Indica el horario, para realizar la atención.',
        choices: ChoiceFactory.toChoices(['9 a 12 am', '12 a 2 pm', '3 a 5 pm', '5 a 7 pm'])
    });
}
async telefonoStep(step){
    console.log('[peticion]: telefonoDialog');
    const horario = step.result.value;
    const att = config.atencion;
    att.horario = horario;

    console.log(config.atencion);
    return await step.prompt(TEXT_PROMPT, 'Escribe tu **teléfono / celular**, para contactarte.');
}
async correoStep(step){
    console.log('[peticion]: correoStep');
    const tel = step.result;
    const att = config.atencion;
    att.tel = tel;

    console.log(config.atencion);
    return await step.prompt(TEXT_PROMPT, 'Escribe tu **correo electrónico** para enviarte los detalles del servicio.');
}
async finalStep(step){
    console.log('[GeneralDialog]: finalStep');
    const email = step.result;
    const att = config.atencion;
    att.email = email;

    console.log(config.atencion);
    return await step.beginDialog(MAIL_DIALOG);

}


    

}
module.exports.GeneralDialog = GeneralDialog;
module.exports.GENERAL_DIALOG = GENERAL_DIALOG;