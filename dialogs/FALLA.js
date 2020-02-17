// DIALOGO DE FALLA
/**
 ______      _      _               
|  ____/\   | |    | |        /\    
| |__ /  \  | |    | |       /  \   
|  __/ /\ \ | |    | |      / /\ \  
| | / ____ \| |____| |____ / ____ \ 
|_|/_/    \_\______|______/_/    \_\
                                                
 */
const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory, TextPrompt,AttachmentPrompt } = require('botbuilder-dialogs');

const { MailDialog, MAIL_DIALOG } = require('./MAIL');
const { OtrosDialog, OTROS_DIALOG } = require('./OTROS');
const FALLA_DIALOG = "FALLA_DIALOG";
const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const ATTACH_PROMPT = "ATTACH_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class FallaDialog extends ComponentDialog {
    constructor(){
        super(FALLA_DIALOG);
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
    console.log('[FallaDialog]: firstStep');
    const details = step.options;
    // console.log(details);
    
    return await step.prompt(CHOICE_PROMPT, {
        prompt: '**Que tipo de falla quieres reportar.**',
        choices: ChoiceFactory.toChoices(['Software', 'Física'])
        
    });
}

async secondStep(step) {
    console.log('[FallaDialog]: secondStep');
    const details = step.options;
    // console.log(details);
    
    const level2 = step.result.value;
    const sol = details.solicitud;
    sol.level2 = level2;
        // console.log(details.solicitud);
        switch (level2) {
            case "Física":
                return await step.prompt(CHOICE_PROMPT,{
                    prompt:'Elije una opción',
                    choices: ChoiceFactory.toChoices(['Mouse', 'Teclado', 'Monitor', 'PC', 'Laptop', 'Docking', 'Impresora', 'No Break'])
                });
            case "Software":
                return await step.prompt(TEXT_PROMPT, `Describe tu ${details.solicitud.level1}`);
                //  return await step.beginDialog(OTROS_DIALOG, details);
        }

    }
    
    async finalStep(step){
        console.log('[FallaDialog]: finalStep');
        const details = step.options;
        console.log(step.result);
        console.log(step.result.value);
        
        if (step. result && step.result.value) {
            const result = step.result.value;
            details.solicitud.level3 = result;
            return await step.beginDialog(MAIL_DIALOG, details);
        } else {
                const details = step.options
                const otros = step.result;
                const sol = details.solicitud;
                sol.level3 = otros;
                console.log(details.solicitud);
                return await step.beginDialog(MAIL_DIALOG, details);
        }
    }
    // async finalStep(step){
    //     console.log('[FallaDialog]: finalStep');
    //     const details = step.options;
    //     console.log(details);
        
    //     if (step.result === undefined) {
    //         console.log(details.solicitud);
    //         return await step.beginDialog(MAIL_DIALOG, details);
    //     } else {
    //         const result = step.result.value;
    //         details.solicitud.level3 = result;
    //         return await step.beginDialog(MAIL_DIALOG, details);
    //     }
    // }
}
module.exports.FallaDialog = FallaDialog;
module.exports.FALLA_DIALOG = FALLA_DIALOG;