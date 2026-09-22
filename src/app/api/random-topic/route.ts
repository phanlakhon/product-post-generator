import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { ThreadCategory, AIProvider } from '@/lib/types';

// Expanded Verified Fact Bank with zero duplicate topics
const VERIFIED_FACT_BANK: Record<ThreadCategory, { topic: string; details: string }[]> = {
  horror: [
    {
      topic: 'ตำนานสยองขวัญสถานีกักกันโรคพอยต์เนเปียน แห่งออสเตรเลีย',
      details: 'สถานีกักกันโรคพอยต์เนเปียน (Point Nepean Quarantine Station) ก่อตั้งขึ้นในปี ค.ศ. 1852 ตั้งอยู่บริเวณปลายคาบสมุทรพอยต์เนเปียน รัฐวิกตอเรีย เคยเป็นสถานีกักกันโรคระบาดทางเรือในยุคคริสต์ศตวรรษที่ 19-20 (เช่น ไข้หวัดใหญ่สเปน ไข้เหลือง และกาฬโรค) มีซากอาคารพยาบาลเก่าและประวัติการเสียชีวิตของผู้ป่วยนับร้อยจนกลายเป็นสถานที่ลี้ลับทางประวัติศาสตร์ในออสเตรเลีย',
    },
    {
      topic: 'ปริศนาคดีมรณกรรมแห่งโรงแรมเซซิล (Cecil Hotel)',
      details: 'โรงแรมเซซิลในลอสแอนเจลิส เปิดทำการอย่างเป็นทางการเมื่อวันที่ 20 ธันวาคม ค.ศ. 1924 (พ.ศ. 2467) มีประวัติศาสตร์อันน่าพรั่นพรึง ทั้งคดีการเสียชีวิตปริศนาของ Elisa Lam ในปี 2013 ในถังน้ำบนดาดฟ้าอาคาร และเคยเป็นที่พักของฆาตกรต่อเนื่องชื่อดังอย่าง Richard Ramirez ในช่วงปี 1985',
    },
    {
      topic: 'ปริศนาช่องเขาเดียตลอฟ: การหายตัวสยองขวัญของ 9 นักสกีในเทือกเขาอูรัล',
      details: 'เหตุการณ์เกิดขึ้นในเดือนกุมภาพันธ์ ค.ศ. 1959 เมื่อนักสกีชาวโซเวียต 9 คนเสียชีวิตอย่างปริศนาในสภาพอุณหภูมิติดลบ เต็นท์ถูกฉีกขาดจากข้างใน สภาพศพมีร่องรอยบาดแผลประหลาดที่ไม่อาจอธิบายได้จนถึงปัจจุบัน',
    },
    {
      topic: 'อาถรรพ์สะพานโอเวอร์ทูน: สะพานฆาตกรรมสุนัขในสกอตแลนด์',
      details: 'สะพานเก่าแก่ในมิลแก็ฟ สกอตแลนด์ สร้างขึ้นในปี ค.ศ. 1895 เกิดเหตุการณ์สุนัขมากกว่า 600 ตัวกระโดดลงมาจากสะพานจุดเดียวกันโดยไม่มีสาเหตุชัดเจนตั้งแต่ช่วงทศวรรษ 1950 เป็นต้นมา',
    },
    {
      topic: 'ซากเรือผีแมรี เซเลสต์: ปริศนาเรือร้างกลางมหาสมุทรแอตแลนติก',
      details: 'เรือสินค้าที่ถูกพบในวันที่ 5 ธันวาคม ค.ศ. 1872 ลอยอยู่กลางทะเลโดยไร้ร่องรอยลูกเรือและผู้โดยสารแม้แต่คนเดียว แต่อาหาร ข้าวของเครื่องใช้ และสินค้ายังอยู่ครบสมบูรณ์ไร้ร่องรอยการต่อสู้',
    },
    {
      topic: 'เกาะงูพิษอันตรายที่สุดในโลก Ilha da Queimada Grande บราซิล',
      details: 'เกาะร้างนอกชายฝั่งบราซิลที่เป็นถิ่นอาศัยของงูหัวหอกทองคำ พิษร้ายแรงจนสามารถย่อยเนื้อเยื่อมนุษย์ได้ รัฐบาลบราซิลสั่งห้ามมนุษย์ย่างก้าวขึ้นเกาะเด็ดขาดตั้งแต่ปี ค.ศ. 1920 เป็นต้นมา',
    },
    {
      topic: 'ปริศนาคฤหาสน์เขาวงกตวินเชสเตอร์ หลอกผีด้วยประตูลวง',
      details: 'คฤหาสน์ 160 ห้องในซานโฮเซ แคลิฟอร์เนีย เริ่มสร้างในปี ค.ศ. 1886 โดย Sarah Winchester ที่เชื่อว่าต้องสร้างบ้านตลอดเวลาเพื่อหลบหนีวิญญาณ มีบันไดเดินไปชนเพดานและประตูเปิดออกไปพบกับผนังเปล่า',
    },
    {
      topic: 'อุโมงค์สุสานใต้ดินปารีส: ที่เก็บโครงกระดูก 6 ล้านเรือนร่าง',
      details: 'อุโมงค์สุสานใต้ดินความยาวนับร้อยกิโลเมตรใต้กรุงปารีส เปิดใช้งานอย่างเป็นทางการในปี ค.ศ. 1810 บรรจุโครงกระดูกมนุษย์มากกว่า 6 ล้านคนตั้งแต่ปลายศตวรรษที่ 18',
    },
    {
      topic: 'ปริศนาป่าอาโอกิการะ ใต้ร่มเงาภูเขาไฟฟูจิ',
      details: 'ป่าทึบขนาดใหญ่เชิงภูเขาไฟฟูจิ ประเทศญี่ปุ่น เกิดขึ้นจากการปะทุของภูเขาไฟฟูจิในปี ค.ศ. 864 มีชื่อเสียงด้านความเงียบสงัด เข็มทิศมักทำงานผิดปกติเนื่องจากแร่เหล็กจากลาวาภูเขาไฟใต้ดิน',
    },
    {
      topic: 'อาถรรพ์เกาะตุ๊กตาผี Isla de las Muñecas เม็กซิโก',
      details: 'เกาะกลางทะเลสาบชินิมิลโก ที่แขวนตุ๊กตาเก่านับพันตัวตามต้นไม้ รวบรวมเริ่มตั้งแต่ช่วงทศวรรษ 1950 โดย Don Julián Santana ชายผู้ย้ายมาอยู่บนเกาะเพื่ออุทิศให้วิญญาณเด็กหญิงที่จมน้ำ',
    },
    {
      topic: 'เกาะมรณะโพเวเกลีย (Poveglia Island) อิตาลี เกาะกักกันโรคที่เฮี้ยนที่สุดในยุโรป',
      details: 'เกาะร้างใกล้เมืองเวนิส ประเทศอิตาลี ที่เคยเป็นสถานที่กักตัวและเผาทำลายศพผู้ป่วยกาฬโรคในยุคกลางมากกว่า 160,000 ศพ ปัจจุบันถูกปิดห้ามคนเข้าชม',
    },
  ],
  news: [
    {
      topic: 'สรุปมหากาพย์วิกฤตระบบ IT CrowdStrike ขัดข้องสะเทือนโลก',
      details: 'สรุปเหตุการณ์ซอฟต์แวร์อัปเดตผิดพลาดจนส่งผลให้คอมพิวเตอร์ระบบ Windows ทั่วโลกเกิดหน้าจอฟ้า (BSOD) สายการบิน ธนาคาร และโรงพยาบาลหยุดชะงักทั่วโลก',
    },
    {
      topic: 'สรุปปรากฏการณ์ AI Deepfake ระบาด และแนวทางปกป้องตัวตนยุคดิจิทัล',
      details: 'สรุปเคสภัยปลอมแปลงเสียงและใบหน้าด้วยเทคโนโลยีปัญญาประดิษฐ์เลียนแบบบุคคลสำคัญ และกลโกงคอลเซ็นเตอร์ยุคใหม่พร้อมวิธีสังเกต',
    },
    {
      topic: 'สรุปการค้นพบน้ำเหลวใต้พื้นผิวดาวอังคารยุคโบราณของ NASA',
      details: 'สรุปข้อมูลจากหุ่นสำรวจดาวอังคารที่พบหลักฐานแหล่งน้ำใต้ดินลึก และโอกาสการค้นพบร่องรอยสิ่งมีชีวิตยุคปฐมกาลนอกโลก',
    },
    {
      topic: 'สรุปสงครามชิปเซมิคอนดักเตอร์โลก (Global Chip War) และเทคโนโลยีแห่งอนาคต',
      details: 'สรุปการแข่งขันแย่งชิงฐานการผลิตชิปประมวลผลขนาด 2 นาโนเมตรระหว่างมหาอำนาจเทคโนโลยี และผลกระทบต่อราคาสินค้าไอทีทั่วโลก',
    },
    {
      topic: 'สรุปปรากฏการณ์คลื่นความร้อนฮีตโดม (Heat Dome) ถล่มทั่วโลก',
      details: 'สรุปสถิติอุณหภูมิโลกพุ่งสูงสถิติใหม่ ปรากฏการณ์ความร้อนครอบแก้วที่ทำให้อากาศร้อนจัดยาวนานหลายสัปดาห์ในหลายทวีป',
    },
    {
      topic: 'สรุปภารกิจยานอวกาศ Artemis สู่การส่งมนุษย์กลับไปเหยียบดวงจันทร์อีกครั้ง',
      details: 'สรุปความคืบหน้าโครงการอวกาศยุคใหม่ของ NASA ที่เตรียมส่งนักบินอวกาศหญิงและนักบินอวกาศผิวสีไปลงจอดบนขั้วใต้ของดวงจันทร์',
    },
  ],
  knowledge: [
    {
      topic: 'ปรากฏการณ์บาเดอร์-ไมน์ฮอฟ (Baader-Meinhof Phenomenon): ทำไมยิ่งสนใจ ยิ่งเห็นบ่อย?',
      details: 'ปรากฏการณ์ทางจิตวิทยาเมื่อเราเพิ่งเรียนรู้หรือสนใจสิ่งใหม่ แล้วพบว่าสิ่งนั้นปรากฏขึ้นรอบตัวบ่อยอย่างน่าประหลาด เกิดจากการเลือกรับรู้ของสมอง (Selective Attention) และการยืนยันความจำ (Confirmation Bias)',
    },
    {
      topic: 'กฎ 80/20 ของปาเรโต (Pareto Principle): ทำน้อยได้มาก สร้างผลลัพธ์สูงสุด',
      details: 'หลักการบริหารเวลาและความคิดที่ว่าผลลัพธ์ 80% เกิดจากปัจจัยสำคัญเพียง 20% ช่วยให้โฟกัสงานที่มีอิมแพกต์สูงสุดและตัดสิ่งที่ไม่จำเป็นออก',
    },
    {
      topic: 'เทคนิคจัดการเวลาแบบพูโมโดโร (Pomodoro Technique): โฟกัสเต็มร้อยโดยไม่อ่อนล้า',
      details: 'วิธีเพิ่มสมาธิด้วยการทำงาน 25 นาที และพักผ่อน 5 นาที ช่วยลดอาการสมองล้าและเพิ่มประสิทธิภาพการทำงานอย่างยั่งยืน',
    },
    {
      topic: 'ภาวะการรับรู้ขัดแย้ง (Cognitive Dissonance): ทำไมคนเราจึงเข้าข้างตัวเอง?',
      details: 'ปรากฏการณ์ทางจิตวิทยาเมื่อความเชื่อและพฤติกรรมไม่สอดคล้องกัน สมองจะพยายามหาเหตุผลมาสนับสนุนความคิดเดิมเพื่อลดความรู้สึกอึดอัดใจ',
    },
    {
      topic: 'เอฟเฟกต์ดันนิ่ง-ครูเกอร์ (Dunning-Kruger Effect): ทำไมคนรู้น้อยถึงมั่นใจมาก?',
      details: 'ปรากฏการณ์ทางจิตวิทยาที่ผู้มีความรู้หรือทักษะน้อยมักประเมินความสามารถของตนเองสูงเกินจริง เนื่องจากขาดทักษะการตระหนักรู้ในความรู้ของตน (Metacognition)',
    },
    {
      topic: 'ปรากฏการณ์เดจาวู (Déjà Vu): ทำไมสมองถึงรู้สึกเหมือนเคยอยู่ในเหตุการณ์นี้มาก่อน?',
      details: 'คำอธิบายทางประสาทวิทยาของอาการรู้สึกคุ้นเคยกับสถานที่หรือสถานการณ์ที่ไม่เคยพบมาก่อน เกิดจากการส่งสัญญาณประสาทเหลื่อมเวลากันในสมองส่วนฮิปโปแคมปัส',
    },
    {
      topic: 'ทฤษฎีความสุข Hedonic Treadmill: ทำไมความสุขจากข้าวของใหม่ถึงอยู่ได้ไม่นาน?',
      details: 'แนวคิดทางจิตวิทยาที่อธิบายว่าคนเราจะปรับระดับความสุขกลับสู่จุดสมดุลเดิมอย่างรวดเร็ว ไม่ว่าจะมีเรื่องดีหรือเรื่องร้ายเกิดขึ้นในชีวิตก็ตาม',
    },
  ],
  review: [
    {
      topic: 'มหากาพย์รีวิว AMT Liposome Emulsion มอยเจอร์ไรเซอร์เสริมเกราะป้องกันผิว',
      details: 'อิมัลชั่นบำรุงผิวสูตรลิโปโซม ซึมไว ไม่เหนอะหนะ ช่วยกักเก็บความชุ่มชื้นและฟื้นฟูผิวแห้งคันระคายเคืองให้กลับมาแข็งแรงเรียบเนียน',
    },
    {
      topic: 'ป้ายยาหูฟังไร้สาย Bluetooth 5.4 มีระบบ ANC ตัดเสียงรบกวน 35dB',
      details: 'หูฟังไร้สายดีไซน์มินิมอล ไมค์ตัดเสียงสนทนาคมชัด แบตเตอรี่อึด 40 ชั่วโมง ให้คุณภาพเสียงเบสแน่นใส คุ้มค่าเกินราคา',
    },
    {
      topic: 'ป้ายยาเก้าอี้เพื่อสุขภาพ Ergonomic Chair ปรับได้ 4 ทิศทาง แก้ปวดหลังออฟฟิศซินโดรม',
      details: 'เก้าอี้เพื่อสุขภาพเบาะผ้าตาข่ายระบายอากาศ รองรับเอวสอดรับกับกระดูกสันหลัง ช่วยลดอาการปวดหลังและคอจากการนั่งทำงานนาน',
    },
    {
      topic: 'รีวิวคีย์บอร์ดไร้สาย Mechanical เสียงเพราะพิมพ์สนุก นุ่มสบายมือ',
      details: 'คีย์บอร์ดไร้สายขนาดกะทัดรัด สวิตช์นุ่ม เสียงพิมพ์ละมุน เชื่อมต่อได้พร้อมกัน 3 อุปกรณ์ เปลี่ยนโต๊ะทำงานให้ดูดีน่าทำงานขึ้น',
    },
    {
      topic: 'ป้ายยาพาวเวอร์แบงค์ MagSafe ขนาดพกพา แปะหลังเครื่องพร้อมขาตั้งในตัว',
      details: 'พาวเวอร์แบงค์ไร้สายชาร์จไว น้ำหนักเบา มีขาตั้งพับเก็บได้ในตัว สามารถดูซีรีส์ไปพร้อมชาร์จแบตเตอรี่สะดวกสบาย',
    },
  ],
  general: [
    {
      topic: 'เรื่องเล่าการสำรวจขั้วโลกใต้ของ Roald Amundsen ชายผู้พิชิตดินแดนน้ำแข็งคนแรก',
      details: 'การเดินทางประวัติศาสตร์ในปี 1911 เมื่อ Roald Amundsen นำทีมเดินทางถึงขั้วโลกใต้สำเร็จด้วยการวางแผนอย่างรัดกุมและการใช้สุนัขลากเลื่อน',
    },
    {
      topic: 'ความลับของหอนาฬิกาบิ๊กเบน (Big Ben) และกลไกนาฬิกาประวัติศาสตร์',
      details: 'เรื่องน่ารู้ของหอนาฬิกาพระราชวังเวสต์มินสเตอร์ที่เปิดใช้งานตั้งแต่ปี 1859 กับความแม่นยำอันทึ่งของลูกตุ้มนาฬิกาที่ปรับความเร็วด้วยเหรียญปอนด์เก่า',
    },
    {
      topic: 'เรื่องราวของเรือรบ Vasa ที่จมลงทะเลตั้งแต่การเดินเรือครั้งแรกในปี 1628',
      details: 'ประวัติศาสตร์เรือรบสุดอลังการของสวีเดนที่สร้างอย่างใหญ่โต แต่จมลงทะเลทันทีหลังจากแล่นออกไปได้เพียง 1,300 เมตรเนื่องจากคำนวณน้ำหนักผิดพลาด',
    },
    {
      topic: 'เรื่องเล่าประทับใจของสุนัขฮาจิโกะ (Hachiko) ยอดสุนัขผู้ซื่อสัตย์แห่งสถานีชิบุยะ',
      details: 'ตำนานความรักและความซื่อสัตย์ของสุนัขสายพันธุ์อากิตะที่มารอเจ้านายกลับจากทำงานที่สถานีรถไฟทุกวันเป็นเวลานานกว่า 9 ปีแม้เจ้านายจะเสียชีวิตไปแล้ว',
    },
    {
      topic: 'ปริศนาลายเส้นนาซกา (Nazca Lines) ภาพวาดขนาดยักษ์บนผืนทรายเพรู',
      details: 'ภาพวาดเรขาคณิตและรูปสัตว์ขนาดใหญ่บนทะเลทรายเพรูที่สร้างขึ้นเมื่อ 2,000 ปีก่อน ซึ่งสามารถมองเห็นเป็นรูปทรงสมบูรณ์ได้จากบนอากาศเท่านั้น',
    },
  ],
};

const FOCUS_SUBTHEMES: Record<ThreadCategory, string[]> = {
  horror: [
    'คดีลี้ลับปริศนาในโรงแรมหรือสถานที่เก่าแก่ยุโรป',
    'ตำนานเรือร้างหรือเกาะร้างอันตรายกลางมหาสมุทร',
    'เหตุการณ์สูญหายปริศนาในเทือกเขาหรือป่าทึบ',
    'คฤหาสน์หรืออาคารที่มีสถาปัตยกรรมลี้ลับ',
  ],
  news: [
    'วิกฤตเทคโนโลยีไอทีหรือความปลอดภัยไซเบอร์ระดับโลก',
    'การค้นพบทางวิทยาศาสตร์ ดาราศาสตร์ หรืออวกาศครั้งใหม่',
    'เทรนด์นวัตกรรม AI และผลกระทบต่อสังคมยุคดิจิทัล',
    'วิกฤตสิ่งแวดล้อม ธรรมชาติ หรือปรากฏการณ์อากาศทั่วโลก',
  ],
  knowledge: [
    'ปรากฏการณ์ทางจิตวิทยาและพฤติกรรมมนุษย์ที่คาดไม่ถึง',
    'เทคนิคพัฒนาตัวเอง การบริหารเวลา และการทำงานยุคใหม่',
    'ความลับของสมอง ความฝัน หรือความจำมนุษย์',
    'หลักการคิดเชิงวิทยาศาสตร์และกฎการตัดสินใจ',
  ],
  review: [
    'อุปกรณ์ไอที แกดเจ็ตโต๊ะทำงาน และสินค้า Smart Home',
    'สกินแคร์ ไอเทมดูแลผิว หรือผลิตภัณฑ์สุขภาพคุ้มค่า',
    'อุปกรณ์เครื่องใช้ไฟฟ้าอำนวยความสะดวกในชีวิตประจำวัน',
    'ของใช้พกพาสำหรับสายเดินทาง หรือไลฟ์สไตล์ยุคใหม่',
  ],
  general: [
    'เหตุการณ์การสำรวจประวัติศาสตร์หรือบุคคลสำคัญระดับโลก',
    'ประวัติศาสตร์สถาปัตยกรรม สิ่งก่อสร้าง และกลไกโบราณ',
    'เรื่องเล่าความซื่อสัตย์ของสัตว์เลี้ยงหรือมิตรภาพมนุษย์',
    'ปริศนาอารยธรรมโบราณและสิ่งมหัศจรรย์ของโลก',
  ],
};

function buildRandomTopicPrompt(category: ThreadCategory, subtheme: string, seed: number) {
  return `You are a creative viral Thai social media content researcher.
Your goal is to suggest 1 UNIQUE, highly captivating, 100% REAL-WORLD topic and brief outline for category: "${category}".

SPECIFIC SUB-THEME FOCUS FOR THIS SUGGESTION:
"${subtheme}"

CRITICAL RULES:
1. MUST BE 100% REAL & FACTUALLY ACCURATE: State real documented facts, exact correct place names, real historical events, or real scientific phenomena.
2. DO NOT SUGGEST POLITICAL PROTESTS IN BANGKOK OR REPETITIVE THAI POLITICS TOPICS! Pick international mysteries, fascinating global news, scientific facts, or viral lifestyle knowledge instead.
3. VARIETY & UNIQUENESS: Make sure the topic is fresh, intriguing, and totally distinct from common generic news.

Random Seed Identifier: ${seed}-${Date.now()}

Output ONLY a valid JSON object matching this exact schema:
{
  "topic": "Catchy headline in Thai describing the real topic with exact correct location/event name",
  "details": "Brief 2-3 sentence background facts and key points in Thai (must be factually accurate with exact dates/years if applicable)"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, provider: inputProvider, apiKey: clientApiKey } = body;

    const targetCategory: ThreadCategory = category || 'horror';
    const cleanClientKey = clientApiKey?.trim();
    let provider: AIProvider = inputProvider || 'openai';

    if (cleanClientKey) {
      if (cleanClientKey.startsWith('sk-')) provider = 'openai';
      if (cleanClientKey.startsWith('AIza')) provider = 'gemini';
    }

    const envKey = provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY;

    let apiKey = '';
    if (cleanClientKey && (cleanClientKey.startsWith('sk-') || cleanClientKey.startsWith('AIza'))) {
      apiKey = cleanClientKey;
    } else if (envKey) {
      apiKey = envKey;
    } else if (cleanClientKey) {
      apiKey = cleanClientKey;
    }

    const bankItems = VERIFIED_FACT_BANK[targetCategory] || VERIFIED_FACT_BANK.horror;
    const randomBankIndex = Math.floor(Math.random() * bankItems.length);
    const selectedBankItem = bankItems[randomBankIndex];

    // 50% chance to pick directly from curated Verified Fact Bank for instant high quality diversity,
    // OR if no API key is set.
    const useBankDirectly = !apiKey || Math.random() < 0.5;
    if (useBankDirectly) {
      return NextResponse.json(selectedBankItem);
    }

    // Otherwise use AI with high temperature (0.85) and rotated sub-theme focus
    const subthemes = FOCUS_SUBTHEMES[targetCategory] || FOCUS_SUBTHEMES.horror;
    const selectedSubtheme = subthemes[Math.floor(Math.random() * subthemes.length)];
    const seed = Math.floor(Math.random() * 1000000);
    const systemPrompt = buildRandomTopicPrompt(targetCategory, selectedSubtheme, seed);

    let parsed: any = {};

    try {
      if (provider === 'openai') {
        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.85, // High temp for creative variety
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Suggest 1 unique real topic for subtheme "${selectedSubtheme}" in category "${targetCategory}" (seed: ${seed})` },
          ],
        });
        const rawText = completion.choices[0]?.message?.content || '{}';
        parsed = JSON.parse(rawText);
      } else {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: systemPrompt,
          config: {
            temperature: 0.85,
            responseMimeType: 'application/json',
          },
        });
        const rawText = response.text || '{}';
        parsed = JSON.parse(rawText);
      }
    } catch (e) {
      console.error('AI Topic Generation failed, falling back to Verified Bank:', e);
      return NextResponse.json(selectedBankItem);
    }

    return NextResponse.json({
      topic: parsed.topic || selectedBankItem.topic,
      details: parsed.details || selectedBankItem.details,
    });
  } catch (error: any) {
    console.error('Random Topic Error:', error);
    const fallbackItem = VERIFIED_FACT_BANK.horror[0];
    return NextResponse.json(fallbackItem);
  }
}
