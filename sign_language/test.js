var fs = require('fs');
var express = require("express");
var mysql = require('mysql');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var msg = require ('dialog');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '038062',
  database: 'sl'
});
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '038062',
  database: 'sl'
};
var sessionStore = new MySQLStore(options);
var app = express();
app.use(express.static('public'));//css파일 불러오기
var path = require('path');
const { Router } = require('express');
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'/')));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
  secret: "!@!#!$",
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}));
var test = fs.readFileSync('./html/searchpage.ejs', 'utf8');
var mydir = fs.readFileSync('./html/mydir.ejs', 'utf8');
var login = fs.readFileSync('./html/login.ejs', 'utf8');
var main = fs.readFileSync('./html/main.ejs', 'utf8');
var signup = fs.readFileSync('./html/signup.ejs', 'utf8');
var loginusername = "";
var checksession ="";          //로그인 세션 변수
var lastsearch = new Array();  //최근검색어 저장 리스트
var today = new Array(); 
var num1=Math.floor(Math.random() * 20) + 1000;
var num2=Math.floor(Math.random() * 10) + 1020;
var num3=Math.floor(Math.random() * 19) + 1030;
//첫화면 설정
app.get('/', (req, res) => {
  if(req.session.id==checksession){   //현재세션과 로그인 세션값이 같으면
    console.log("test1",req.session.id, checksession);
  var page = ejs.render(main, {
    title: loginusername+"님",
    text : loginusername+"님 환영합니다",
    data2 : lastsearch,
  });
}else{
  console.log("test2",req.session.id, checksession);
  var page = ejs.render(main, {
    title: "main",
    data2 : lastsearch,
  });
  }
  res.send(page);
});
app.get('/searchpage', function (req, res) {
    console.log(num1);
    console.log(num2);
    console.log(num3);
    connection.query('SELECT slid, title, img from language  where slid=? or slid =? or slid =?', [num1,num2,num3],function (err, rows, fields) {
      if (!err) {
          for(var i=0;i<rows.length;i++){
              if(today.length!=3){   //최대 검색어 저장수는 3개
                     today.push(rows[i]);
              }
          }
          console.log(today);
        var page = ejs.render(test, {
          title: "searchpage",
          data3: today,
          data2 : lastsearch,
          logindata: loginusername,
        });
        res.send(page);
      }
      else
      {
        console.log('Error while performing Query.');

      }
    });
});
app.get('/login', function(req, res) {
  var page = ejs.render(login, {
    title: "Login",
  });
  res.send(page);
})
app.get('/signup', function(req, res) {
  var page = ejs.render(signup, {
    title: "SIGNUP",
  });
  res.send(page);
})

app.get('/mydir', function (req, res) {
  console.log("userid", loginusername);
  if (loginusername != "") {      //사전접근에 로그인 필수로 설정
    connection.query('SELECT A.slid as slid, title, img from language as A LEFT JOIN dir as B on A.slid = B.slid where userid = ?', [loginusername], function (err, rows, fields) {
      if (!err) {
        var page = ejs.render(mydir, {
          title: "나만의 단어장",
          data: rows,
          data2 : lastsearch,

        });
        res.send(page);
      }
      else
      {
        console.log('Error while performing Query.');

      }
    });
  } else {
    var page = ejs.render(mydir, {
      title: "나만의 단어장",
      text: "로그인이 필요합니다.",
      data2 : lastsearch,

    });

    msg.info ("로그인이 필요한 서비스입니다.");
    res.redirect('/login');
  };

});
connection.connect(function (err) {
  if (!err) {
    console.log("Database is connected ... \n\n");
  } else {
    console.log("Error connecting database ... \n\n");
  }
});

//단어검색에 사용
app.post('/search1', function (req, res) {
  console.log("test2");

  var body = req.body;
  if(lastsearch.length==3){   //최대 검색어 저장수는 3개
    lastsearch.shift()
    lastsearch.push(body.test1)
  }else
    lastsearch.push(body.test1)
  console.log(lastsearch);
  connection.query('SELECT * from language where title LIKE ?', '%' + [body.test1] + '%', function (err, rows, fields) {
    if (!err) {
      var page = ejs.render(test, {
        title: "단어 검색",
        data: rows,
        data2 : lastsearch,
        data3: today,

      });
      res.send(page);
      console.log('The solution is: ', rows);
    }
    else
      console.log('Error while performing Query.');
  });
});

//카테고리
app.post('/search2', function (req, res) {
  var c;
  var body = req.body;
  console.log(body);
  //category테이블에서 이름과 일치하는category_id 추출
  var sql='SELECT category_id FROM category WHERE sub_category = "' + [body.category] + '";';
  connection.query(sql,function (err, rows, fields) {
  var id =rows[0].category_id;
     if(err){
      console.log(err);
    } 
      else {//language테이블에서 id와 일치하는 데이터 추출
      var sql2='SELECT * from language where sub_category= "' + [id] + '";';
      connection.query(sql2, function (err, rows, fields) {
    if (!err) {
      var page = ejs.render(test, {
        title: "단어 검색",
        data: rows,
        data2 : lastsearch,
        data3: today,
      });
      res.send(page);
      console.log('The solution is: ', rows);
    }
    else
      console.log('Error while performing Query.');
  });
  }
  });
});


//단어장에 추가 기능
app.post('/adddir1', function (req, res) {
  var body = req.body;
  console.log('addtest', req.session.id, body.test2);
  console.log(body.test2);
  connection.query('INSERT INTO dir(userid,slid) values(?,?)', [loginusername, body.test2], function (err, rows, fields) {
    connection.query('SELECT A.slid as slid, title, img from language as A LEFT JOIN dir as B on A.slid = B.slid where userid = ?', [loginusername], function (err, row, fields) {
      if (!err) {
        var page = ejs.render(mydir, {
          title: "나만의 단어장",
          data: row,
          data2 : lastsearch,

        });
        res.send(page);
        console.log('The solution issss: ', rows);

        console.log('The solution is: ', row);
      }
      else
        console.log('Error while performing Query.');
    });
  });
});
//단어삭제 테스트
app.post('/deletedir', function (req, res) {
  var body = req.body;
  console.log('deletetest', body.test3);
  connection.query('delete from dir where userid=? and slid =?', [loginusername, body.test3], function (err, rows, fields) {
    if (!err) {
      res.redirect('/mydir');
    }
      else {
      console.log('Error while performing Query.');
    }
  });
});
//회원가입 테스트
app.post('/signup1', function(req, res) {
  console.log("signtest");
  var body = req.body;
  if (blankcheck(body.username, body.userID, body.password, body.password_check)) {
    console.log(body.userID, body.password, body.username);

    connection.query('INSERT INTO user(userid,pw,name) values(?,?,?)', [body.userID, body.password, body.username], function(err, rows, fields) {
      if (!err) {
        console.log("sign in test1", rows);
        console.log("sign in test2", body.userID, body.password, body.username);
        res.redirect('/');
      } else
      {
        console.log('Error while performing Query.');
        msg.info ("이미 존재하는 아이디 입니다.");
      }
    });
  }
});
//로그인 test
app.post('/login1', function(req, res) {
  console.log("logintest");
  var body = req.body;
  if (blank(body.userID, body.password)) {
    console.log('id', body.userID, 'pw', body.password);
    loginusername = body.userID;
    connection.query('select * from user where userid = ? and pw =?', [body.userID, body.password], function(err, results, rows) {
      if (!err) {
        if (results != '') {
          loginusername = results[0].name;
          console.log(results);
          console.log("이름", results[0].name);
          req.session.id = req.body.userID;
          checksession = req.session.id;
          console.log("sign in test1", req.session.id);
          req.session.save(function() {
            res.redirect('/');
          });
        } else {
          console.log("아이디 비번 확인");
          msg.info ("아이디 또는 비밀번호가 일치하지 않습니다.");
          res.redirect("/login");
        }
      } else {
        console.log("query error");
      }
    });
  }

});
app.get('/logout', function (req, res) {
  console.log("로그아웃")
  loginusername = "";
  req.session.destroy(
    function (err) {
      res.redirect('/');
    });

});

function blankcheck(name, id, pw, pw_ck) { //공백이랑 비밀번호 같은지 검사
  //아이디 비밀번호 조건주기
  if (name.length < 1 || id.length < 1 || pw.length < 1 || pw_ck.length < 1) {
    //이름은 2글자 이상 아이디 비번 6글자 이상
    console.log("글자수, 공백");
    return false;
  } else if (pw != pw_ck) {
    //비밀번호 검사
    console.log("비밀번호 다름");
    return false;
  } else {
    console.log("통과");
    return true;
  }
}

function blank(id, pw) {
  if (id.length < 1 || pw.length < 1) {
    console.log("공백");
    return false;
  } else {
    console.log("통과");
    return true;
  }
}
app.listen(3000);