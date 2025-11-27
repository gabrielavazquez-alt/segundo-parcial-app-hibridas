import api from "./api";

export async function fetchTranslators() {
    const res = await api.get("/users/translators");
    return res.data.translators;
}
