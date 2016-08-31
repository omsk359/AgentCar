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
export default carsFromStr(getTable2_1Str())


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
                 color: c[6], mileage: +c[7],
                 engine: { type: c[8], capacity: c[9], power: c[10] },
                 kpp: c[11], price: +_.replace(c[12], /,/g, '')
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
VESTA	 XRAY 	Сranta	KALINA Cross	4х4, 3 -х дверная	LARGUS
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
VESTA	 XRAY 	Сranta	KALINA Cross	4х4, 3 -х дверная	LARGUS
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
