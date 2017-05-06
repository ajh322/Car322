var express = require("express");
var path = require("path");
var app = express();
var engine = require('ejs-locals');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var fs = require('fs');
var bodyParser = require('body-parser');
var htmlBuilder = require('./modules/html-builder');
var ip = "35.160.55.61";
var server_url = ip + ":8080";
var conn = mongoose.createConnection(ip + '/car');
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(conn);
var car = require('./models/car');
var part_category = require('./models/part_category');
var part = require('./models/part');
var const_case = require('./models/construction_case');
var multer = require('multer')
var mkdirp = require('mkdirp');
app.use(express.static(__dirname + '/public'));
var storage_main = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("바디:");
        console.log(req.body);
        mkdirp('./public/' + req.body.part_category, function (err) {
            console.log(err);
            // path exists unless there was an error
        });
        cb(null, './public/' + req.body.part_category)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
var upload_main = multer({storage: storage_main});
app.set('port', process.env.PORT || 8080);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
//자동 업데이트 기능
app.post('/deploy/', function (req, res) {
    var spawn = require('child_process').spawn,
        deploy = spawn('sh', ['./deploy.sh']);

    deploy.stdout.on('data', function (data) {
        console.log('' + data);
    });

    deploy.on('close', function (code) {
        console.log('Child process exited with code ' + code);
    });
    res.json(200, {message: 'Github Hook received!'})
});

//테스트용
app.get('/', function (req, res) {
    console.log("come");
    res.end();
});

app.get('/add_const_case_100', function (req, res) {
    for (var i = 0; i < 100; i++) {
        var fluffy = new const_case({
            "Title": "아우디A6 블루투스 힘박스와 억스 활성화",
            "Car": "아우디 A6",
            "Region": "서울특별시 금천구",
            "Company": "유베카",
            "Price": "360000",
            "Time": "3",
            "Contents": "아우디 전용 AUX 모듈과 블루투스 모듈 힘박스를 활성화합니다.",
            "Carimage": "유베카1a.jpg,유베카1b.jpg,유베카1c.jpg,유베카1d.jpg"
        });
        fluffy.save(function (err, res) {
            console.log(res);
        })
    }
    const_case.find({}).exec(function (err, doc) {
        res.end(JSON.stringify(doc));
    })
})
app.get('/add_const_case_1', function (req, res) {
    var fluffy = new const_case({
        "Title": "아우디A6 블루투스 힘박스와 억스 활성화",
        "Car": "아우디 A6",
        "Region": "서울특별시 금천구",
        "Company": "유베카",
        "Price": "360000",
        "Time": "3",
        "Contents": "아우디 전용 AUX 모듈과 블루투스 모듈 힘박스를 활성화합니다.",
        "Carimage": "유베카1a.jpg,유베카1b.jpg,유베카1c.jpg,유베카1d.jpg"
    });
    fluffy.save(function (err, res) {
        console.log(res);
    })
    const_case.find({}).exec(function (err, doc) {
        res.end(JSON.stringify(doc));
    })
})

app.get('/get_const_case', function (req, res) {
    const_case.find({}).exec(function (err, doc) {
        res.end(JSON.stringify(doc));
    })
})
app.post('/get_const_case', function (req, res) {
    //start, end
    var docs = "[";
    var start = req.body.start;
    var end = req.body.end;
    console.log(start);
    const_case.find({}).exec(function (err, doc) {
        if (start < 0)
            start = 0;
        if (end <= start)
            end = start;
        for (; start < end; start++) {
            try {
                docs += doc[start] + ",";
                //console.log(docs);
            } catch (e) {
            }
        }
        docs = docs.substr(0, docs.length - 1);
        docs += "]"
        res.end(JSON.stringify(docs));
    })
})
//시공사례 삭제
app.get('/const_case_remove', function (req, res) {
    const_case.remove({}, function (err, doc) {
        res.end(JSON.stringify(doc));
    });
})
//파트 카테고리 추가
app.post('/insert_part_category', function (req, res) {
    if (req.body.part_category != "") {
        conn.collection('part_category').insert({part_category: req.body.part_category});
        /*  차량중심 데이터 등록으로 인하여 바뀜
         fs.writeFile(__dirname + "/views/" + req.body.part_category + ".ejs", htmlBuilder.buildHtml("ejs_for_add_part_category"), function (err) {
         if (err) {
         return console.log(err);
         }
         console.log("The file was saved!");
         });
         */
        part_category.find({}).exec(function (err, doc) {
            console.log(doc)
            res.redirect('/add_part_category');
        });
    }
    else {
        res.end("잘못된 입력");
    }
})

//파트 카테고리 추가
app.get('/add_part_category', function (req, res) {
    part_category.find({}).exec(function (err, doc) {
        console.log(doc)
        res.render('add_part_category', {data: doc, length: doc.length});
    });
});

//파트 카테고리 json으로 받기
app.get('/get_part_category', function (req, res) {
    part_category.find({}).exec(function (err, doc) {
        res.end(JSON.stringify(doc));
    })
});
//파트 카테고리 리셋
app.get('/reset_part_category', function (req, res) {
    //아래 기본 파트카테고리가 아닌것 전부다 불러오기
    part_category.find({
        part_category: {
            '$nin': ["frontbumper", "bodykit", "headlight", "taillight", "wheel", "hood", "spoiler", "grill", "allled", "roof", "tint", "rearbumper", "sidemirror", "sidekirt "]
        }
    }).remove().exec(function (err) {
        part_category.find({}).exec(function (err) {
            res.redirect('/add_part_category');
        })
    });

});
//파트 카테고리 페이지 선택하는곳
app.get('/select_part_category', function (req, res) {
    part_category.find({}).exec(function (err, doc) {
        res.render('select_part_category', {data: doc, length: doc.length});
    })
});

//파트 카테고리 선택하고나서 보내주기
app.get('/go_part_category', function (req, res) {
    part.find({part_category: req.query.part_category}).exec(function (err, doc) {
        console.log("파트 카테고리" + req.query.part_category);
        res.render(req.query.part_category, {data: doc, length: doc.length, part_category: req.query.part_category});
    })
});
app.get('/get_part', function (req, res) {
    part.find({}).exec(function (err, doc) {
        res.end(JSON.stringify(doc));
    })
});
app.post('/get_part_by_car_name', function (req, res) {
    console.log(req.body);
    console.log(req.body.car_name);
    part.find({car_name:req.body.car_name}).exec(function (err, doc) {
        res.end(JSON.stringify(doc));
    })
});
app.post('/get_part_by_category', function (req, res) {
    part.find({part_category:req.body.part_category}).exec(function (err, doc) {
        res.end(JSON.stringify(doc));
    })
});
//차량추가 페이지
app.get('/add_car', function (req, res) {
    car.find({}).exec(function (err, doc) {
        res.render('add_car', {data: doc, length: doc.length});
    })
});
//차량 추가
app.post('/add_car', function (req, res) {
    if (req.body.car_name != "") {
        conn.collection('car').insert({car_name: req.body.car_name});
        res.redirect("/add_car");
    }
    else {
        res.end("잘못된 입력");
    }
})
//파트 추가하는 페이지
app.get('/add_part', function (req, res) {
    part_category.find({}).exec(function (err, doc) {
        car.find({}).exec(function (err, doc_l) {
            res.render('add_part', {
                part_data: doc,
                part_data_length: doc.length,
                car_data: doc_l,
                car_data_length: doc_l.length
            });
        });
    });
});
//파트 추가하기
var add_part_upload = upload_main.fields([{name: 'img', maxCount: 1}, {name: 'file', maxCount: 1}]);
app.post('/add_part', add_part_upload, function (req, res, next) {
    console.log(req.files);
        try {
            conn.collection('part').insert({
                part_category: req.body.part_category,
                part_name: req.body.part_name,
                car_name: req.body.car_name,
                img_url: server_url + req.files.img[0].path.split('public')[1],
                file_url: server_url + req.files.file[0].path.split('public')[1]
            });
        } catch (e) {
            conn.collection('part').insert({
                part_category: req.body.part_category,
                part_name: req.body.part_name,
                car_name: req.body.car_name,
            });

        }

        res.redirect('./add_part')
})
app.listen(app.get('port'), function () {
    console.log("going");
})
function get_part_category() {
    part_category.find({}).exec(function (err, doc_l) {
        return doc_l;
    });
};
