import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const responseTime = new Trend(
    "alumni_response_time"
);

const errorRate = new Rate(
    "alumni_error_rate"
);

export const options = {

    stages: [
        { duration: "20s", target: 1000 },
        { duration: "20s", target: 2000 },
        { duration: "20s", target: 2500 },
        { duration: "40s", target: 2500 },
        { duration: "20s", target: 0 }
    ],

    thresholds: {

        http_req_failed: [
            "rate<0.01"
        ],

        http_req_duration: [
            "p(95)<1000"
        ],

        alumni_error_rate: [
            "rate<0.01"
        ]

    }

};


const BASE_URL =
    __ENV.BASE_URL ||
    "http://127.0.0.1:5000";


const TOKEN =
    __ENV.JWT_TOKEN;


if (!TOKEN) {

    throw new Error(
        "JWT_TOKEN environment variable is required."
    );

}


// Different realistic directory requests
const requests = [

    "/api/alumni?page=1&limit=20&sort=name",

    "/api/alumni?page=2&limit=20&sort=name",

    "/api/alumni?page=3&limit=20&sort=name",

    "/api/alumni?page=1&limit=20&sort=batch-newest",

    "/api/alumni?page=1&limit=20&sort=batch-oldest",

    "/api/alumni?page=1&limit=20&verification=verified",

    "/api/alumni?page=1&limit=20&verification=pending",

    "/api/alumni?page=1&limit=20&search=a",

    "/api/alumni?page=1&limit=20&search=e",

    "/api/alumni?page=1&limit=20&search=alumni"

];


export default function () {

    const index =
        (__VU + __ITER) %
        requests.length;


    const endpoint =
        requests[index];


    const response =
        http.get(

            `${BASE_URL}${endpoint}`,

            {

                headers: {

                    Authorization:
                        `Bearer ${TOKEN}`,

                    Accept:
                        "application/json"

                }

            }

        );


    const passed = check(
        response,
        {

            "status is 200":
                (res) =>
                    res.status === 200,

            "response is JSON":
                (res) =>
                    String(
                        res.headers[
                            "Content-Type"
                        ] || ""
                    ).includes(
                        "application/json"
                    ),

            "request under 1 second":
                (res) =>
                    res.timings.duration <
                    1000

        }
    );


    responseTime.add(
        response.timings.duration
    );


    errorRate.add(
        !passed
    );


    sleep(1);

}