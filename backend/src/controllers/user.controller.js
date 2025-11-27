const { getTranslators } = require('../services/user.service');

async function listTranslators(req, res) {
    try {
        const translators = await getTranslators();
        return res.json({ ok: true, translators });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ ok: false, message: 'Error obteniendo traductores.' });
    }
}

module.exports = {
    listTranslators,
};
