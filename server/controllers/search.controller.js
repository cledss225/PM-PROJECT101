const Search = require("../models/search.model");


const SearchController = {


    async searchAll(req, res) {

        try {

            const keyword =
                String(
                    req.query.q || ""
                ).trim();


            if (!keyword) {

                return res.json({

                    success: true,

                    query: "",

                    count: 0,

                    results: []

                });

            }


            const roleId =
                Number(
                    req.user.role_id
                );


            const results =
                await Search.searchAll(
                    keyword,
                    roleId
                );


            return res.json({

                success: true,

                query: keyword,

                count: results.length,

                results

            });


        } catch (error) {


            console.error(
                "GLOBAL SEARCH ERROR:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error.message ||
                        "Unable to search the system."

                });

        }

    }


};


module.exports = SearchController;