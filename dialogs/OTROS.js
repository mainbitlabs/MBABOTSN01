// PREGUNTA ABIERTA 
/** 
          ____ _______ _____   ____   _____ 
         / __ \__   __|  __ \ / __ \ / ____|
        | |  | | | |  | |__) | |  | | (___  
        | |  | | | |  |  _  /| |  | |\___ \ 
        | |__| | | |  | | \ \| |__| |____) |
         \____/  |_|  |_|  \_\\____/|_____/ 
                                                               
*/
const config = require('../config');

const { ComponentDialog, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');

const OTROS_DIALOG = "OTROS_DIALOG";

const TEXT_PROMPT = "TEXT_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class OtrosDialog extends ComponentDialog {
    constructor(){
        super(OTROS_DIALOG);
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.otrosStep.bind(this),
            this.saveStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;
    }

async otrosStep(step){
    console.log('[otrosStep]: OtrosStep');
    return await step.prompt(TEXT_PROMPT, `Describe tu ${config.solicitud.level1}`);
    }   

async saveStep(step){
    console.log('[saveStep]: OtrosStep');
    
    const otros = step.result;
    config.solicitud.level3 = otros;
    console.log(config.solicitud);
    return await step.endDialog();

    }   

}
module.exports.OtrosDialog = OtrosDialog;
module.exports.OTROS_DIALOG = OTROS_DIALOG;