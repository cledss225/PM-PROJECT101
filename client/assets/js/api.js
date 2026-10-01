const API_URL = "http://localhost:5000/api";


async function apiRequest(endpoint, options = {}) {


    const token = localStorage.getItem("token");


    const config = {

        headers: {

            "Content-Type": "application/json",

            ...(token && {
                Authorization: `Bearer ${token}`
            })

        },

        ...options

    };


    const response = await fetch(
        API_URL + endpoint,
        config
    );


    const data = await response.json();


    return data;

}