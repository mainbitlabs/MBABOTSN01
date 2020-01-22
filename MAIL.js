const config = require('../config');
const azurest = require('azure-storage');
var nodeoutlook = require('nodejs-nodemailer-outlook');
const tableSvc1 = azurest.createTableService(config.storageA1, config.accessK1);
const azureTS = require('azure-table-storage-async');

const { ComponentDialog, WaterfallDialog, ChoicePrompt, ChoiceFactory, TextPrompt,AttachmentPrompt } = require('botbuilder-dialogs');

const MAIL_DIALOG = "MAIL_DIALOG";
const CHOICE_PROMPT = "CHOICE_PROMPT";
const TEXT_PROMPT = "TEXT_PROMPT";
const ATTACH_PROMPT = "ATTACH_PROMPT";
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';


class MailDialog extends ComponentDialog {
    constructor(){
        super(MAIL_DIALOG);
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new AttachmentPrompt(ATTACH_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.mailStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;

    }

async mailStep(step){
    console.log('[MailDialog]: mailStep');
    
    const date = step.result;
    const sol = config.solicitud;
    sol.date = date;
    console.log(config.solicitud);
    
    const result = await azureTS.retrieveEntityAsync(tableSvc1, config.table3, 'CASM', config.casm);
    config.sendemail = result.Contacto._;

    const email = new Promise((resolve, reject) => {
        nodeoutlook.sendEmail({
            auth: {
                user: `${config.email1}`,
                pass: `${config.pass}`,
            }, from: `${config.email1}`,
            to: `${config.sendemail}`,
            subject: `${config.proyecto} Tipo de solicitud: ${config.solicitud.level1}: ${config.serie} / ${config.solicitud.level2} / ${config.solicitud.level3}`,
            html: `<p>Solicitud:</p> <br> <b>${config.solicitud.level1} / ${config.solicitud.level2} / ${config.solicitud.level3}</b> <br> <b><blockquote>Fecha y horario de atención: ${config.atencion.fecha}, ${config.atencion.horario}, ${config.atencion.tel}</blockquote></b> <br> <b>Proyecto: ${config.proyecto}</b>  <br> <b>Serie: ${config.modelo}</b> <br> <b>Serie: ${config.serie}</b> <br> <b>Usuario: ${config.usuario}</b> <br> <b>Marca: ${config.marca}</b> <br> <b>Dirección: ${config.direccion}</b> <br> <b>Estado: ${config.estado}</b> <br> <b>Inmueble: ${config.inmueble}</b> <br> <b>Teléfono: ${config.telefono}</b> <br> <b>Extensión: ${config.ext}</b>`,
            onError: (e) => reject(console.log(e)),
            onSuccess: (i) => resolve(console.log(i))
            }
        );
        
    });
    await result;
    await email;

    await step.context.sendActivity(`**Gracias por tu apoyo, se enviará un correo con tu solicitud:**\n\n ‣${config.solicitud.level1} de ${config.solicitud.level2} ${config.solicitud.level3} \n\n **Tu horario de atención será:**\n\n ‣ ${config.atencion.fecha}, ${config.atencion.horario}`);
    return await step.endDialog();

    }   

}
module.exports.MailDialog = MailDialog;
module.exports.MAIL_DIALOG = MAIL_DIALOG;