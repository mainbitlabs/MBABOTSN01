// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ComponentDialog, DialogTurnStatus } = require('botbuilder-dialogs');
const {ActivityTypes} = require ('botbuilder');

/**
 * This base class watches for common phrases like "help" and "cancel" and takes action on them
 * BEFORE they reach the normal bot logic.
 */
class CancelAndHelpDialog extends ComponentDialog {

    async onContinueDialog(innerDc) {
        const result = await this.interrupt(innerDc);

        if (result) {
            return result;
        }
        return await super.onContinueDialog(innerDc);
    }


    async interrupt(innerDc) {
        if (innerDc.context.activity.text) {
            
            const text = innerDc.context.activity.text.toLowerCase();
    
            switch (text) {
                case 'ayuda':
                    const mainbit = { type: ActivityTypes.Message };
                    mainbit.attachments = [this.getMainbit()];
                    mainbit.text = 'Hola, puedo ayudarte con información de la sucursal, registrar tu entrada y subir las fotos de tus actividades.'
                    await innerDc.context.sendActivity(mainbit);
                    return { status: DialogTurnStatus.waiting };

                case 'bot':
                    const bot = { type: ActivityTypes.Message };
                   bot.attachments = [this.getBot()];
                    bot.text = 'Hola humano, puedo ayudarte con información de la sucursal, registrar tu entrada y subir las fotos de tus actividades.'
                    await innerDc.context.sendActivity(bot);
                    return { status: DialogTurnStatus.waiting };
                     
                case 'cancel':
                case 'cancelar':
                case 'salir':
                    await innerDc.context.sendActivity('Cancelando...');
                    return await innerDc.cancelAllDialogs();

                case 'help':
                case '?':
                    await innerDc.context.sendActivity('[ This is where to send sample help to the user... ]');
                    return { status: DialogTurnStatus.waiting };
            }
        } else {
            
        }
    }
    getBot(){
        return {
            name:'BOT',
            contentType: 'image/gif',
            contentUrl: 'https://raw.githubusercontent.com/esanchezlMBT/images/master/BOT.gif'
        }
    }
    getMainbit(){
        return {
            name:'mainbit',
            contentType: 'image/jpg',
            contentUrl: 'https://raw.githubusercontent.com/esanchezlMBT/images/master/mainbit.jpg'
        }
    }

}

module.exports.CancelAndHelpDialog = CancelAndHelpDialog;
