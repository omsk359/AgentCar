import _ from 'lodash';
import request from 'superagent';
import cheerio from 'cheerio';
import URL from 'url';

async function getCars() {
    var s1 = getTable1Str(), s2 = getTable2Str();
    var cars1 = carsFromStr(s1), cars2 = carsFromStr(s2);
    var cars = [...cars1, ...cars2];

    for (let car of cars) {
        console.log('getImage: ', car.photo);
        try {
            car.photo = await getImage(car.photo);
        } catch (e) {
            console.error(e);
        }
    }
    return cars;
}

// export { getCars }
// export default carsFromStr(getTable2_1Str())
const LadaCars = carsFromStr(getTableLadaStr());
const LadaCarsProduction = LadaCars.map(car => ({ ...car, ownerId: 'kZD2WwvnheG9RCkeK' }));
const LadaTest1 = LadaCars.map(car => ({ ...car, ownerId: 'kZD2WwvnheGtest1' }));
const LadaTest2 = LadaCars.map(car => ({ ...car, ownerId: 'kZD2WwvnheGtest2' }));
// LadaCars.forEach(car => car.ownerId = 'kZD2WwvnheG9RCkeK');

export default [ ...LadaCars, ...LadaCarsProduction, ...LadaTest1, ...LadaTest2 ];

async function getImage(url) {
    let res = await request.get(url).timeout(5000);
    let $ = cheerio.load(res.text);
    let host = URL.parse(url).hostname;
    if (host == 'sigma-service.ru')
        var h = $('.no_back_pic img').attr('src');
    else if (host == 'www.lada-dealer.ru')
        h = $('#promo').attr('style').match(/\/.*\.jpg/)[0];
    let img = URL.resolve(url, h);
    console.log('img: ', img)
    return img;
}
// getImage('http://www.lada-dealer.ru/ru/avtomobili/modelnyi-rjad/largus/larguscross/');

function carsFromStr(s) {
    var lines = s.split('\n').filter(s => /\S/.test(s));
    // _.pullAt(lines, [12, 13]);
    console.log('lines[0]: ', lines[0]);
    console.log(`lines[${lines.length-1}]: `, lines[lines.length-1]);

    var cars = _.transform(lines, (obj, line, i) => {
        var fields = line.split('\t');
        fields.forEach((f, j) => obj[j][i] = f.trim());
    }, _.range(lines[0].split('\t').length).map(() => []));
    console.log('cars[0]: ', cars[0]);

    var carsDB = cars.map(c => {
        return { photo: c[0], mark: c[2], model: c[3], equipment: c[4] || '', carcase: c[5] || '',
                 color: c[6], mileage: +c[7], year: +c[8],
                 engine: { type: c[9], capacity: c[10], power: c[11] },
                 kpp: c[12], price: +_.replace(c[13], /,/g, '')
             }
        });
    carsDB.forEach(car => _.assign(car, { ownerId: 'kZD2WwvnheG9RCwwD', checked: true }));
    console.log('carsDB[0]: ', carsDB[0]);

    return carsDB;
}


function getTable1Str() {
    return `
http://sigma-service.ru/models/available_cars/J11596/	http://sigma-service.ru/models/available_cars/X03266/	http://sigma-service.ru/models/available_cars/J12654/	http://sigma-service.ru/models/available_cars/J14200/	http://sigma-service.ru/models/available_cars/J15776/	http://sigma-service.ru/models/available_cars/J11478/	http://sigma-service.ru/models/available_cars/J12360/	http://sigma-service.ru/models/available_cars/J12366/	http://sigma-service.ru/models/available_cars/J09764/
Skoda Rapid Active	Skoda Rapid Ambition	Skoda Rapid Style	Skoda Octavia Active	Skoda Rapid Ambition	Skoda Yeti Outdoor Active	Skoda Octavia Ambition	Skoda Octavia Ambition	Skoda Yeti Outdoor Ambition

Skoda	Skoda	Skoda	Skoda	Skoda	Skoda	Skoda	Skoda	Skoda
Rapid 	Rapid	Rapid 	Octavia 	Rapid 	Yeti 	 Octavia 	 Octavia 	Yeti
Аctive	Ambition	Style	Active	Ambition	Outdoor Active	Ambition	Ambition	Outdoor Ambition

седан	седан 	седан 	седан	седан	седан	седан	седан	седан
белый 	коричневый металлик	черный перламутр 	белый	красный металлик	черный перламутр 	белый 	синий металлик	серый металлик
100,000	0	0	0	0	0	0	0	0


бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый
1.6	1,8	1,6	1,8	1,4	1,6	1,6	1,8	1,8
110	180	110	180	125	110	110	180	152
МКПП	DSG	АКПП	МКПП	DSG	АКПП	МКПП	DSG	DSG

720,201	862,925	885,937	923,200	932,728	1,052,915	1,085,000	1,257,150	1,361,515
`.trim();
}

function getTable2Str() {
    return `
http://www.lada-dealer.ru/ru/avtomobili/modelnyi-rjad/vesta/	http://www.lada-dealer.ru/ru/avtomobili/modelnyi-rjad/xray/krossover/	http://www.lada-dealer.ru/ru/avtomobili/modelnyi-rjad/granta/sedean/	http://www.lada-dealer.ru/ru/avtomobili/modelnyi-rjad/kalina2/hetchbek/	http://www.lada-dealer.ru/ru/avtomobili/modelnyi-rjad/4x4/3-dvernaja/	http://www.lada-dealer.ru/ru/avtomobili/modelnyi-rjad/largus/larguscross/
LADA VESTA	LADA XRAY 	LADA Granta	LADA KALINA Сross	LADA 4х4, 3 - х дверная	LADA Largus

LADA	LADA	LADA	LADA	LADA	LADA
VESTA	 XRAY 	Granta	KALINA Cross	4х4, 3 -х дверная	LARGUS
Сlassice
седан	кроссовер	седан 	хетчбек		универсал
серебристый 	серо-бежевый	белый	оранжевый перламутровый	темно-зеленый	красный
0	0	0	0	0	0


бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый
1,6, 16 кл.	1,8 16 кл.	1,6, 8 кл.	1,6, 16. кл.	1,7, 8 кл.	1,6, 16. кл.
106 л.с.	122 л.с.	87 л.с.	106 л.с.	83 л.с.	105 л.с.
5 МТ	5 АМТ	5МТ	5 АМТ	5 МТ	МКПП


539,000	752,000	393,000	552,000	446,700	582,200
`.trim();
}

function getTable2_1Str() {
    return `
https://img-fotki.yandex.ru/get/31286/2648717.4/0_a9461_39c7c2d2_S	https://img-fotki.yandex.ru/get/51134/2648717.4/0_a946a_386347ff_S	https://img-fotki.yandex.ru/get/98971/2648717.2/0_a9402_56717717_S	https://img-fotki.yandex.ru/get/28561/2648717.3/0_a9419_b66a856b_S	https://img-fotki.yandex.ru/get/53078/2648717.1/0_a93e1_409851df_S	https://img-fotki.yandex.ru/get/118251/2648717.3/0_a9448_caa34e43_S
LADA VESTA	LADA XRAY 	LADA Granta	LADA KALINA Сross	LADA 4х4, 3 - х дверная	LADA Largus

LADA	LADA	LADA	LADA	LADA	LADA
VESTA	 XRAY 	Granta	KALINA Cross	4х4, 3 -х дверная	LARGUS
Сlassice
седан	кроссовер	седан 	хетчбек		универсал
серебристый 	серо-бежевый	белый	оранжевый перламутровый	темно-зеленый	красный
0	0	0	0	0	0


бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый
1,6, 16 кл.	1,8 16 кл.	1,6, 8 кл.	1,6, 16. кл.	1,7, 8 кл.	1,6, 16. кл.
106 л.с.	122 л.с.	87 л.с.	106 л.с.	83 л.с.	105 л.с.
5 МТ	5 АМТ	5МТ	5 АМТ	5 МТ	МКПП


539,000	752,000	393,000	552,000	446,700	582,200
`.trim();
}

function getTableLadaOldPictsStr() {
    return `
https://img-fotki.yandex.ru/get/31286/2648717.4/0_a9461_39c7c2d2_S	https://img-fotki.yandex.ru/get/31286/2648717.4/0_a9461_39c7c2d2_S	https://img-fotki.yandex.ru/get/51134/2648717.4/0_a946a_386347ff_S	https://img-fotki.yandex.ru/get/118251/2648717.4/0_a946c_472a6e2b_S	https://img-fotki.yandex.ru/get/51134/2648717.2/0_a9403_23cbb4c0_S	https://img-fotki.yandex.ru/get/98971/2648717.2/0_a9402_56717717_S	https://img-fotki.yandex.ru/get/108497/2648717.2/0_a9400_8c8fa3c_S	https://img-fotki.yandex.ru/get/28561/2648717.3/0_a9419_b66a856b_S	https://img-fotki.yandex.ru/get/27612/2648717.3/0_a941b_3c36ff53_S	https://img-fotki.yandex.ru/get/53078/2648717.1/0_a93e1_409851df_S	https://img-fotki.yandex.ru/get/53145/2648717.2/0_a93f2_3b1e4067_S	https://img-fotki.yandex.ru/get/30602/2648717.3/0_a9439_7b83fb62_S	https://img-fotki.yandex.ru/get/149948/2648717.3/0_a9441_babcf9e6_S
LADA VESTA	LADA VESTA	LADA XRAY 	LADA XRAY 	LADA Granta	LADA Granta	LADA Granta лифтбек	LADA KALINA Сross	LADA KALINA 	LADA 4х4, 3 - х дверная	LADA 4х4, 5-ти дверная	LADA Largus, 5 мест	LADA Largus, 7 мест

LADA	LADA	LADA	LADA	LADA	LADA	LADA	LADA	LADA	LADA	LADA	LADA	LADA
VESTA	VESTA	 XRAY 	 XRAY 	Granta	Granta	Granta	KALINA Cross	KALINA 	4х4, 3 -х дверная	4х4, 5-ти дверная	LARGUS	LARGUS
Сlassice	Comfort	Optima	TOP	Cтандарт	Норма	Стандарт	Норма	стандарт	стандарт	стандарт	стандарт	норма
седан	седан 	хетчбек	хетчбек	седан 	седан 	лифтбек	универсал	хетчбек	универсал	универсал	универсал 	универсал
серебристый 	серебристый	cеребристый	cеребристый	серебристый	серебристый	серебристый	серебристый	серебристый	синий	зеленый	серый	серый
0	0	0	0	0	0	0	0	0	0	0


бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый
1,6, 16 кл.	1,6, 16 кл.	1,6 16 кл.	1,6 16 кл.	1,6, 8 кл.	1,6, 8 кл.	1,6, 8 кл.	1,6, 16. кл.	1,6, 8 кл.	1,7, 8 кл.	1,7, 8 кл.	1,6, 8 кл.	1,6, 8 кл.
106 л.с.	106 л.с.	122 л.c.	122 л.c.	87 л.с.	87 л.с.	87 л.с.	106 л.с.	87 л.с.	83 л.с.	83 л.с.	87 л.с.	87 л.с.
5 МТ	5 МТ	5 АМТ	5 АМТ	5МТ	5МТ	5МТ	5 АМТ	5 АМТ	МКПП	МКПП	5МТ	5МТ


554,000	582,000	669,000	710,000	383,900	419,600	404,200	512,100	435,500	462,700	506,700	524,500	590,000
`.trim();
}


function getTableLadaStr() {
    return `
https://resize.yandex.net/0_a9461_39c7c2d2_M?url=https%3A%2F%2Fimg-fotki.yandex.ru%2Fget%2F31286%2F2648717.4%2F0_a9461_39c7c2d2_M&width=222&height=0&typemap=gif%3Agif%3Bpng%3Apng%3B*%3Ajpeg%3B&timestamp=1472800563&crop=no&enlarge=no&key=3c47f2f9e9de1e4be385556e5b3a2318	https://resize.yandex.net/0_a9461_39c7c2d2_M?url=https%3A%2F%2Fimg-fotki.yandex.ru%2Fget%2F31286%2F2648717.4%2F0_a9461_39c7c2d2_M&width=222&height=0&typemap=gif%3Agif%3Bpng%3Apng%3B*%3Ajpeg%3B&timestamp=1472800563&crop=no&enlarge=no&key=3c47f2f9e9de1e4be385556e5b3a2318	https://resize.yandex.net/0_a946a_386347ff_M?url=https%3A%2F%2Fimg-fotki.yandex.ru%2Fget%2F51134%2F2648717.4%2F0_a946a_386347ff_M&width=222&height=0&typemap=gif%3Agif%3Bpng%3Apng%3B*%3Ajpeg%3B&timestamp=1472800694&crop=no&enlarge=no&key=6f19673ba6e8fb93de1e03a3d8a31980	https://resize.yandex.net/0_a946a_386347ff_M?url=https%3A%2F%2Fimg-fotki.yandex.ru%2Fget%2F51134%2F2648717.4%2F0_a946a_386347ff_M&width=222&height=0&typemap=gif%3Agif%3Bpng%3Apng%3B*%3Ajpeg%3B&timestamp=1472800694&crop=no&enlarge=no&key=6f19673ba6e8fb93de1e03a3d8a31980	https://resize.yandex.net/0_a9403_23cbb4c0_M?url=https%3A%2F%2Fimg-fotki.yandex.ru%2Fget%2F51134%2F2648717.2%2F0_a9403_23cbb4c0_M&width=222&height=0&typemap=gif%3Agif%3Bpng%3Apng%3B*%3Ajpeg%3B&timestamp=1472800758&crop=no&enlarge=no&key=a22d3f0fcac82f31caa3a97160b2d39d	https://resize.yandex.net/0_a9403_23cbb4c0_M?url=https%3A%2F%2Fimg-fotki.yandex.ru%2Fget%2F51134%2F2648717.2%2F0_a9403_23cbb4c0_M&width=222&height=0&typemap=gif%3Agif%3Bpng%3Apng%3B*%3Ajpeg%3B&timestamp=1472800758&crop=no&enlarge=no&key=a22d3f0fcac82f31caa3a97160b2d39d	https://resize.yandex.net/0_a9401_8c0eaa9a_M?url=https%3A%2F%2Fimg-fotki.yandex.ru%2Fget%2F112407%2F2648717.2%2F0_a9401_8c0eaa9a_M&width=222&height=0&typemap=gif%3Agif%3Bpng%3Apng%3B*%3Ajpeg%3B&timestamp=1472800836&crop=no&enlarge=no&key=aaba0776e021e147f43325f0ee99cc59	https://resize.yandex.net/0_a9419_b66a856b_M?url=https%3A%2F%2Fimg-fotki.yandex.ru%2Fget%2F28561%2F2648717.3%2F0_a9419_b66a856b_M&width=222&height=0&typemap=gif%3Agif%3Bpng%3Apng%3B*%3Ajpeg%3B&timestamp=1472800875&crop=no&enlarge=no&key=a29d249a0920327fc5ade68c1a0a126f	https://resize.yandex.net/0_a941b_3c36ff53_M?url=https%3A%2F%2Fimg-fotki.yandex.ru%2Fget%2F27612%2F2648717.3%2F0_a941b_3c36ff53_M&width=222&height=0&typemap=gif%3Agif%3Bpng%3Apng%3B*%3Ajpeg%3B&timestamp=1472800910&crop=no&enlarge=no&key=83ec6bcbb3b9602596059bee233d54a7	https://resize.yandex.net/0_a93e1_409851df_M?url=https%3A%2F%2Fimg-fotki.yandex.ru%2Fget%2F53078%2F2648717.1%2F0_a93e1_409851df_M&width=222&height=0&typemap=gif%3Agif%3Bpng%3Apng%3B*%3Ajpeg%3B&timestamp=1472800969&crop=no&enlarge=no&key=9df7eba9d3f1ac8fc3757d0f137af0b0	https://resize.yandex.net/0_a93f3_3f11167_M?url=https%3A%2F%2Fimg-fotki.yandex.ru%2Fget%2F50260%2F2648717.2%2F0_a93f3_3f11167_M&width=222&height=0&typemap=gif%3Agif%3Bpng%3Apng%3B*%3Ajpeg%3B&timestamp=1472801008&crop=no&enlarge=no&key=93535df0dfcb9c9901e03d909b2ec0ee	https://resize.yandex.net/0_a943a_54f17bf2_M?url=https%3A%2F%2Fimg-fotki.yandex.ru%2Fget%2F151498%2F2648717.3%2F0_a943a_54f17bf2_M&width=222&height=0&typemap=gif%3Agif%3Bpng%3Apng%3B*%3Ajpeg%3B&timestamp=1472801045&crop=no&enlarge=no&key=03112041c84a4fde3e765beb78427c1c	https://resize.yandex.net/0_a9441_babcf9e6_M?url=https%3A%2F%2Fimg-fotki.yandex.ru%2Fget%2F149948%2F2648717.3%2F0_a9441_babcf9e6_M&width=222&height=0&typemap=gif%3Agif%3Bpng%3Apng%3B*%3Ajpeg%3B&timestamp=1472801073&crop=no&enlarge=no&key=2b72208ef8a21a3b21cbc33ffcda6033
LADA VESTA	LADA VESTA	LADA XRAY 	LADA XRAY 	LADA Granta	LADA Granta	LADA Granta лифтбек	LADA KALINA Сross	LADA KALINA 	LADA 4х4, 3 - х дверная	LADA 4х4, 5-ти дверная	LADA Largus, 5 мест	LADA Largus, 7 мест

LADA	LADA	LADA	LADA	LADA	LADA	LADA	LADA	LADA	LADA	LADA	LADA	LADA
VESTA	VESTA	 XRAY 	 XRAY 	Granta	Granta	Granta	KALINA Cross	KALINA 	4х4, 3 -х дверная	4х4, 5-ти дверная	LARGUS	LARGUS
Сlassice	Comfort	Optima	TOP	Cтандарт	Норма	Стандарт	Норма	стандарт	стандарт	стандарт	стандарт	норма
седан	седан 	хетчбек	хетчбек	седан 	седан 	лифтбек	универсал	хетчбек	универсал	универсал	универсал 	универсал
серебристый 	серебристый	cеребристый	cеребристый	серебристый	серебристый	серебристый	серебристый	серебристый	синий	зеленый	серый	серый
50	0	0	0	0	0	0	0	0	0	0	0	0
2015	2016	2016	2016	2016	2016	2016	2016	2016	2016	2016	2016	2016


бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый	бензиновый
1,6, 16 кл.	1,6, 16 кл.	1,6 16 кл.	1,6 16 кл.	1,6, 8 кл.	1,6, 8 кл.	1,6, 8 кл.	1,6, 16. кл.	1,6, 8 кл.	1,7, 8 кл.	1,7, 8 кл.	1,6, 8 кл.	1,6, 8 кл.
106 л.с.	106 л.с.	122 л.c.	122 л.c.	87 л.с.	87 л.с.	87 л.с.	106 л.с.	87 л.с.	83 л.с.	83 л.с.	87 л.с.	87 л.с.
5 МТ	5 МТ	5 АМТ	5 АМТ	5МТ	5МТ	5МТ	5 АМТ	5 АМТ	МКПП	МКПП	5МТ	5МТ


554,000	582,000	669,000	710,000	383,900	419,600	404,200	512,100	435,500	462,700	506,700	524,500	590,000
`.trim();
}
