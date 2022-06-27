'use strict';

var server = require('server');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var URLUtils = require('dw/web/URLUtils');

server.get(
    'Show',
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var actionUrl = dw.web.URLUtils.url('Newsletter-Handler');
        var newsletterForm = server.forms.getForm('newsletter');
        newsletterForm.clear();

        res.render('/newsletter/newslettersignup', {
            actionUrl: actionUrl,
            newsletterForm: newsletterForm
        });

        next();
    }
);

server.post(
    'Handler',
    server.middleware.https,csrfProtection.validateAjaxRequest,
    function (req, res, next) {
    	var newsletterForm = server.forms.getForm('newsletter');
    	var continueUrl = URLUtils.url('Newsletter-Show');


    	if (newsletterForm.valid) {
            var Transaction = require('dw/system/Transaction');
    		try {
                Transaction.wrap(function(){
                    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
                    var co = CustomObjectMgr.createCustomObject('NewsletterSubscription', newsletterForm.email.value);
                    co.custom.firstName = newsletterForm.fname.value;
                    co.custom.lastName = newsletterForm.lname.value
                    res.render('/newsletter/newslettersuccess',{
                        continueUrl: continueUrl,
                        successMsg: dw.web.Resource.msg('message.thank.subscription','newsletter',null),
                        newsletterForm: newsletterForm
                    });
                });
            }catch(e){
                var err = e;
                res.render('/newsletter/newslettererror', {
                    errorMsg: dw.web.Resource.msg('error.request.subscription', 'newsletter', null),
                    continueUrl: continueUrl
                });
            }
        }else{
            res.render('/newsletter/newslettererror', {
            errorMsg: dw.web.Resource.msg('error.request.subscription', 'newsletter', null),
            continueUrl: continueUrl
            });
        }
        next();
    }
);



module.exports = server.exports();