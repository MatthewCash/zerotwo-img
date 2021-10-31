import axios from 'axios';

export const translateTextMicrosoft = async (text: string): Promise<string> => {
    const res = await axios
        .post(
            'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=en',
            [{ text }],
            {
                headers: {
                    'Ocp-Apim-Subscription-Key':
                        process.env.AZURE_TRANSLATE_API_KEY,
                    'Ocp-Apim-Subscription-Region': 'westus2'
                }
            }
        )
        .catch(error => {
            console.log('An error occured while translating with Microsoft');
            console.warn(error);
            return null;
        });

    return res?.data?.[0]?.translations?.[0]?.text;
};

export const translateTextGoogle = async (text: string): Promise<string> => {
    const encodedText = encodeURIComponent(text);

    const res = await axios
        .get(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=${encodedText}`
        )
        .catch(error => {
            console.log('An error occured while translating with Google');
            console.warn(error);
            return null;
        });

    const translations = res?.data?.[0] as any[];

    const translatedText = translations?.map(t => t?.[0])?.join('');

    return translatedText;
};
