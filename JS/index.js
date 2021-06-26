API_KEY = "34c8103e63msh909728bfda25be5p1bb0fbjsnd587398101bf"; // PLEASE DON'T SHARE 

        var language_to_id = {
            "C": 50,
            "C++": 54,
            "Java": 62,
            "Python": 71,
        };

        function encode(str) {
            return btoa(unescape(encodeURIComponent(str || "")));
        }

        function decode(bytes) {
            var escaped = escape(atob(bytes || ""));
            try {
                return decodeURIComponent(escaped);
            } catch {
                return unescape(escaped);
            }
        }

        function errorHandler(jqXHR, textStatus, errorThrown) {
            $("#output").val(`${JSON.stringify(jqXHR, null, 4)}`);
            $("#run").prop("disabled", false);
        }

        function check(token) {
            $("#output").val($("#output").val() + "\nChecking submission status...");
            $.ajax({
                url: `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`,
                type: "GET",
                headers: {
                    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
	                "x-rapidapi-key": API_KEY
                },
                success: function (data, textStatus, jqXHR) {
                    if ([1, 2].includes(data["status"]["id"])) {
                        $("#output").val($("#output").val() + "\nStatus: " + data["status"]["description"]);
                        setTimeout(function() { check(token) }, 1000);
                    }
                    else {
                        var output = [decode(data["compile_output"]), decode(data["stdout"])].join("\n").trim();
                        $("#output").val(output);
                        $("#run").prop("disabled", false);
                    }
                },
                error: errorHandler
            });
        }

        function run() {
            $("#run").prop("disabled", true);
            $("#output").val("Creating submission...");
            $.ajax({
                url: "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true",
                type: "POST",
                contentType: "application/json",
                headers: {
                    "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
	                "x-rapidapi-key": API_KEY
                },
                data: JSON.stringify({
                    "language_id": language_to_id[$("#lang").val()],
                    "source_code": encode($("#source").val()),
                    "stdin": encode($("#input").val()),
                    "redirect_stderr_to_stdout": true
                }),
                success: function(data, textStatus, jqXHR) {
                    $("#output").val($("#output").val() + "\nSubmission created.");
                    setTimeout(function() { check(data["token"]) }, 2000);
                },
                error: errorHandler
            });
        }

        $("body").keydown(function (e) {
            if (e.ctrlKey && e.keyCode == 13) {
                run();
            }
        });

        $("textarea").keydown(function (e) {
            if (e.keyCode == 9) {
                e.preventDefault();
                var start = this.selectionStart;
                var end = this.selectionEnd;

                var append = "    ";
                $(this).val($(this).val().substring(0, start) + append + $(this).val().substring(end));

                this.selectionStart = this.selectionEnd = start + append.length;
            }
        });

        $("#source").focus();