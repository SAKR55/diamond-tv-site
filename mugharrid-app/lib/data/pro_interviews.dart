/// بنك مقابلات العمل: 24 وظيفة، لكل وظيفة 6 أسئلة خاصة بها + 30 سؤالاً عاماً
/// + 20 سؤالاً من قوالب المقابلة الأساسية = نحو 56 سؤالاً وجواباً نموذجياً لكل وظيفة.
library;

/// أسئلة عامة تصلح لكل الوظائف. الخانات: {0} المسمى، {1} المجال، {2} الميزة.
const _general = <String>[
  'What is your greatest achievement?|My greatest achievement was finishing a big project in {1} two weeks early.',
  'How do you stay up to date in your field?|I read articles about {1} and I take short online courses.',
  'Tell me about a time you failed.|I once missed a deadline. Now I plan my time better and I ask for help early.',
  'How do you handle criticism?|I listen carefully, thank the person, and use the advice to improve.',
  'Describe your ideal boss.|My ideal boss gives clear goals and trusts me to do my work.',
  'What do you do when you disagree with a colleague?|I listen to their view, explain mine calmly, and we find a solution together.',
  'How do you manage your time?|I make a daily plan and I do the most important task first.',
  'Are you willing to work extra hours?|Yes. When the team needs me, I am happy to help.',
  'Are you willing to move to another city?|Yes, I am flexible and open to moving for the right opportunity.',
  'What are your career goals?|I want to become an expert in {1} and later lead a team.',
  'What did you like most about your last job?|I liked working with a supportive team and learning new skills every month.',
  'What did you dislike about your last job?|I wanted more chances to learn, and this role offers that.',
  'How would your colleagues describe you?|They would say I am reliable, friendly, and always ready to help.',
  'What makes you different from other candidates?|I combine strong {2} with real experience in {1}.',
  'Can you give an example of leadership?|I led a small group on a project, shared the tasks, and we finished on time.',
  'How do you deal with a difficult person?|I stay calm, listen without interrupting, and offer a clear solution.',
  'What would you do in your first month here?|I would learn how the team works, meet everyone, and start helping with small tasks.',
  'Tell me about a time you worked under a tight deadline.|I made a clear plan, asked the team for help, and we delivered before the deadline.',
  'Do you have experience with our tools?|I learn new tools quickly, and I have already used similar ones.',
  'How do you relax after a stressful day?|I go for a walk and spend time with my family.',
  'What would you do if you did not know the answer?|I would ask a colleague or look it up, and then I would remember it for next time.',
  'How do you decide what to do first when everything is urgent?|I ask what matters most to the customer and the company, and I start with that.',
  'Tell me about a time you helped a colleague.|A new colleague was lost, so I showed him the system and answered his questions.',
  'Have you ever improved a process at work?|Yes. I suggested a simple checklist, and it saved the team two hours every week.',
  'What is your work style?|I am organised and I like clear steps, but I stay flexible when plans change.',
  'Is there anything in your CV that you want to explain?|Yes. I had a short break to finish a course, and it improved my skills in {1}.',
  'How soon can you answer if we make you an offer?|I can give you an answer within two days.',
  'Do you have other job offers?|I am talking to a few companies, but this role is my first choice.',
  'What does success mean to you?|Success means doing good work, learning every day, and helping the team win.',
  'Why did you choose this career?|I have always enjoyed {1}, and I like work where I can see real results.',
];

/// كل وظيفة: [الاسم بالعربية، المسمى بالإنجليزية، المجال، الميزة، ثم أسئلة وأجوبة بصيغة سؤال|جواب]
const _jobs = <List<String>>[
  [
    'محاسب', 'an accountant', 'finance', 'attention to detail',
    'Which accounting software have you used?|I have used Excel and QuickBooks for invoices, reports, and monthly accounts.',
    'How do you make sure your numbers are correct?|I check every entry twice and I compare the totals with the bank statements.',
    'What is the difference between profit and cash flow?|Profit is what remains after costs, but cash flow is the money that actually moves in and out.',
    'Have you ever found a mistake in the accounts?|Yes. I found a double payment, told my manager at once, and we corrected it the same day.',
    'How do you prepare for the end of the month?|I make a checklist, collect all invoices early, and close the accounts step by step.',
    'How do you explain numbers to people who are not accountants?|I use simple words and a small chart, and I focus on what the numbers mean for the business.',
  ],
  [
    'مندوب مبيعات', 'a sales representative', 'sales', 'communication',
    'How do you find new customers?|I use calls, visits, and referrals, and I follow up with every lead.',
    'How do you handle a customer who says the price is too high?|I explain the value, compare it with the benefits, and offer the best option for their budget.',
    'What was your best sales month?|I reached one hundred and twenty percent of my target because I called every old customer again.',
    'How do you deal with rejection?|I do not take it personally. I ask why, learn from it, and call the next customer.',
    'How do you build a long relationship with a customer?|I keep in touch, solve problems quickly, and call after the sale to check they are happy.',
    'How do you close a deal?|I summarise the benefits, ask if they have any last questions, and then I ask for the order.',
  ],
  [
    'مبرمج', 'a software developer', 'technology', 'problem solving',
    'Which programming languages do you use?|I use Python and JavaScript every day, and I am learning Dart.',
    'How do you find and fix a bug?|I repeat the problem, read the error message, test small parts, and fix the cause, not only the symptom.',
    'Tell me about a project you built.|I built a mobile app for booking appointments, and more than a thousand people use it.',
    'How do you work with other developers?|I write clear code, use version control, and review my teammates code politely.',
    'How do you test your work?|I write simple tests for the main features and I try to break my own code before release.',
    'How do you learn a new technology?|I read the documentation, build a small project, and then ask more experienced people for feedback.',
  ],
  [
    'خدمة عملاء', 'a customer service agent', 'customer service', 'patience',
    'How do you handle an angry customer?|I stay calm, let the customer speak, say sorry for the problem, and then solve it.',
    'What do you do when you cannot solve the problem?|I explain honestly what I will do next, pass it to the right team, and call the customer back.',
    'How do you speak to a customer on the phone?|I speak slowly and clearly, smile, and repeat the main points to be sure we understand each other.',
    'How do you deal with many customers at the same time?|I serve them in order, give each one my full attention, and tell people if they need to wait.',
    'What does good customer service mean to you?|It means listening, being polite, and solving the problem the first time.',
    'Tell me about a customer who thanked you.|A customer lost his order, and I found it in one day. He sent a thank-you message to my manager.',
  ],
  [
    'ممرض', 'a nurse', 'healthcare', 'compassion',
    'Why did you choose nursing?|I want to help people when they are most in need, and I feel proud when a patient gets better.',
    'How do you stay calm in an emergency?|I follow the steps I learned, speak clearly to the team, and focus on one task at a time.',
    'How do you speak to a frightened patient?|I use a gentle voice, explain what I am doing, and ask if they have any questions.',
    'How do you make sure you give the right medicine?|I check the patient name, the medicine, the dose, and the time before I give it.',
    'How do you work with doctors and other nurses?|I share clear information at every shift change and I ask when I am not sure.',
    'How do you take care of yourself after a hard shift?|I rest, eat well, and talk with my colleagues. It helps me stay strong for the next day.',
  ],
  [
    'طبيب', 'a doctor', 'medicine', 'careful listening',
    'Why did you choose this specialty?|I enjoy solving medical puzzles and building long relationships with patients.',
    'How do you give bad news to a patient?|I choose a quiet place, speak simply and honestly, and give the patient time to ask questions.',
    'How do you decide when to send a patient to a specialist?|If the symptoms are unclear or the treatment does not work, I ask a specialist for advice.',
    'How do you manage a long day of patients?|I keep each visit focused, write clear notes, and ask the team for support when it is busy.',
    'How do you keep your knowledge up to date?|I read new studies every week and I attend training courses every year.',
    'Tell me about a difficult case.|A patient had strange symptoms. I asked more questions, ordered a test, and we found the cause.',
  ],
  [
    'صيدلي', 'a pharmacist', 'pharmacy', 'accuracy',
    'How do you check a prescription?|I read the name, dose, and instructions, and I check that the medicine is safe for the patient.',
    'What do you do if the doctor writing is not clear?|I call the doctor and confirm before I give any medicine.',
    'How do you explain medicine to an elderly patient?|I speak slowly, write the times on the box, and ask the patient to repeat the instructions.',
    'What would you do if a medicine is out of stock?|I check other branches, suggest a safe alternative with the doctor, and order it quickly.',
    'How do you deal with a customer who wants a medicine without a prescription?|I explain the rules politely and I suggest what is safe, or I advise them to see a doctor.',
    'How do you keep the pharmacy organised?|I label every shelf, check expiry dates every week, and keep a clear stock list.',
  ],
  [
    'معلم', 'a teacher', 'education', 'patience',
    'Why do you want to be a teacher?|I love seeing students understand something new and become more confident.',
    'How do you keep students interested?|I use stories, short activities, and questions, and I praise every effort.',
    'How do you deal with a noisy class?|I stay calm, set clear rules at the start, and give the students a task to focus on.',
    'How do you help a weak student?|I find out what is difficult, explain in a simpler way, and give small tasks so the student can succeed.',
    'How do you plan a lesson?|I choose a clear goal, prepare three activities, and finish with a short quiz.',
    'How do you talk to parents?|I am friendly and honest, and I share both the good news and the areas to improve.',
  ],
  [
    'مهندس مدني', 'a civil engineer', 'construction', 'planning',
    'Which projects have you worked on?|I worked on a residential building and a small bridge, from drawings to the final inspection.',
    'How do you make sure a site is safe?|I check the equipment every morning, make sure everyone wears protection, and stop work if there is a risk.',
    'How do you keep a project on schedule?|I make a weekly plan, track progress every day, and solve delays before they grow.',
    'What do you do if the drawings and the site do not match?|I stop, measure again, talk to the designer, and write down every change.',
    'Which software do you use?|I use AutoCAD for drawings and Excel for quantities and costs.',
    'How do you manage workers on site?|I give clear instructions, listen to their ideas, and treat everyone with respect.',
  ],
  [
    'مصمم جرافيك', 'a graphic designer', 'design', 'creativity',
    'Which design programs do you use?|I use Photoshop and Illustrator, and I am learning Figma.',
    'Can you describe your design process?|I start with the brief, draw quick ideas, choose one direction, and improve it with feedback.',
    'How do you handle a client who does not like your design?|I ask what they dislike, explain my idea, and make changes that fit their goal.',
    'How do you work with a tight deadline?|I focus on the main message first and I finish the details at the end.',
    'Where do you find inspiration?|I look at posters, packaging, and photography, and I keep a folder of ideas.',
    'Tell me about your favourite project.|I designed a complete brand for a small cafe, including the logo, menu, and signs.',
  ],
  [
    'مدير مشاريع', 'a project manager', 'project management', 'leadership',
    'How do you start a new project?|I define the goal, the budget, and the deadline, and then I make a clear plan with the team.',
    'How do you deal with a project that is late?|I find the cause, change the plan, and tell the client honestly what we will do.',
    'How do you motivate your team?|I give clear goals, thank people for good work, and remove problems that stop them.',
    'How do you manage risks?|I list the possible problems at the start, give each one an owner, and review the list every week.',
    'How do you report progress?|I send a short weekly update with what is done, what is next, and what help I need.',
    'What do you do when two team members disagree?|I talk to each of them, find the real problem, and agree on a solution together.',
  ],
  [
    'مسوّق رقمي', 'a digital marketer', 'marketing', 'creativity',
    'Which social media platforms do you manage?|I manage Instagram, Facebook, and TikTok, and I plan the posts every month.',
    'How do you measure the success of a campaign?|I look at reach, clicks, and sales, and I compare them with our goal.',
    'How do you write a good advertisement?|I speak to one clear customer, show the main benefit, and add a simple call to action.',
    'What would you do if a campaign does not work?|I check the data, test a new message or picture, and try again with a small budget.',
    'How do you know what customers want?|I read their comments, run short surveys, and watch what they search for.',
    'Tell me about a campaign you are proud of.|I ran an offer for a small shop and the online orders doubled in one month.',
  ],
  [
    'موظف استقبال فندق', 'a hotel receptionist', 'hospitality', 'friendliness',
    'How do you welcome a guest?|I smile, say good morning, and ask how I can help. I try to make every guest feel special.',
    'What do you do if the hotel is fully booked?|I apologise, suggest a nearby hotel, and offer to call them for the guest.',
    'How do you handle a complaint about a noisy room?|I say sorry, offer a quiet room if possible, and send the manager to check the problem.',
    'Which languages do you speak?|I speak Arabic and English, and I know basic words in French.',
    'How do you check in a guest quickly?|I prepare the documents in advance, ask for the passport, and explain the hotel services in one minute.',
    'What would you do if two guests argue in the lobby?|I stay calm, separate them politely, and ask each guest to explain what happened.',
  ],
  [
    'طاهٍ', 'a chef', 'cooking', 'creativity',
    'What is your specialty?|I love grilled dishes and traditional recipes, and I add a modern touch.',
    'How do you keep the kitchen clean and safe?|I clean as I cook, keep food at the right temperature, and wash my hands often.',
    'How do you work under pressure at a busy time?|I prepare everything before the rush, and I talk clearly with the team during service.',
    'What do you do when a customer sends a dish back?|I listen to the reason, fix the problem quickly, and learn from it.',
    'How do you reduce waste in the kitchen?|I plan the menu carefully, use every part of the ingredients, and check the stock every day.',
    'How do you create a new dish?|I start with fresh seasonal ingredients, test small amounts, and ask my team to taste it.',
  ],
  [
    'بائع', 'a shop assistant', 'retail', 'friendliness',
    'How do you help a customer who is only looking?|I say hello, give them space, and offer help if they have a question.',
    'What do you do when an item is out of stock?|I check the other branches, offer a similar item, or order it for the customer.',
    'How do you handle the cash register?|I count carefully, give the correct change, and check the total at the end of the shift.',
    'How do you deal with a long line of customers?|I work quickly and politely, and I ask a colleague to open another register.',
    'How do you arrange products on the shelf?|I put the popular items at eye level and keep each section clean and neat.',
    'How would you handle a customer who wants to return an item?|I check the receipt, follow the store policy, and stay polite even if I must say no.',
  ],
  [
    'سائق ولوجستيات', 'a delivery driver', 'logistics', 'reliability',
    'How do you plan your delivery route?|I check the addresses, avoid traffic, and put the closest orders first.',
    'What do you do if a customer is not at home?|I call the customer, wait a few minutes, and follow the company rule for a second delivery.',
    'How do you keep the goods safe?|I load them carefully, check them before I leave, and drive smoothly.',
    'Have you had an accident or a problem on the road?|I had a flat tyre once. I stopped safely, informed the office, and finished the delivery later.',
    'How do you keep your records?|I scan every package, take a signature, and send the report at the end of the day.',
    'How do you stay alert during a long drive?|I take short breaks, drink water, and never drive when I am too tired.',
  ],
  [
    'فني كهرباء وصيانة', 'a maintenance technician', 'maintenance', 'safety awareness',
    'What are the first safety steps before you repair something?|I switch off the power, put up a warning sign, and test that there is no electricity.',
    'How do you find the cause of a fault?|I ask what happened, check the simple things first, and then test each part step by step.',
    'Which tools and equipment can you use?|I can use a multimeter, a drill, and basic hand tools, and I always check them first.',
    'What do you do in an emergency call at night?|I take the main tools, go to the site quickly, and make the place safe first.',
    'How do you explain a repair to a customer?|I show the problem, explain the repair in simple words, and give the price before I start.',
    'How do you plan regular maintenance?|I make a monthly schedule, check the machines, and write every repair in a log.',
  ],
  [
    'موارد بشرية', 'an HR officer', 'human resources', 'communication',
    'How do you screen job applications?|I check the CV against the job requirements and then call the best candidates.',
    'How do you handle a conflict between two employees?|I meet each person separately, listen to both sides, and help them agree on a fair solution.',
    'What makes a good workplace?|Clear rules, respect, and chances for people to learn and grow.',
    'How do you keep employee information private?|I save files in a secure system and share information only with people who need it.',
    'How do you welcome a new employee?|I prepare the desk and the documents, introduce the team, and check in after the first week.',
    'How do you give feedback to an employee?|I choose a private place, start with what went well, and then explain what to improve.',
  ],
  [
    'موظف بنك', 'a bank employee', 'banking', 'accuracy',
    'How do you explain a bank product to a customer?|I ask about their needs first, then I explain the benefits and the costs in simple words.',
    'How do you protect customer information?|I never share account details, I verify the customer identity, and I follow the bank security rules.',
    'What do you do if you see a suspicious transaction?|I stop, report it to my supervisor, and follow the bank procedure.',
    'How do you deal with a customer who lost a card?|I block the card at once, calm the customer, and order a new one.',
    'How do you reach your monthly targets?|I follow up with customers, offer products that really suit them, and keep a clear list.',
    'How do you handle a long line at the branch?|I work quickly and accurately, and I explain the waiting time politely.',
  ],
  [
    'سكرتير ومساعد إداري', 'an administrative assistant', 'office administration', 'organisation',
    'How do you organise your manager schedule?|I use a shared calendar, set reminders, and check the next day plan every evening.',
    'How do you answer the phone in the office?|I say the company name, greet the caller, and take a clear message if the manager is busy.',
    'How do you keep documents organised?|I use clear folder names, scan important papers, and keep a backup.',
    'What do you do when your manager asks for two things at the same time?|I ask which one is more urgent and I tell him when the second will be ready.',
    'Which office programs do you use?|I use Word, Excel, and Outlook every day, and I can make simple presentations.',
    'How do you arrange a business meeting?|I check everyone availability, book a room, send the agenda, and remind people the day before.',
  ],
  [
    'مدير مطعم', 'a restaurant manager', 'restaurant management', 'leadership',
    'How do you train new waiters?|I let them watch an experienced waiter, practise with me, and then give them feedback.',
    'What do you do when a customer is unhappy with the food?|I apologise, offer a new dish or a discount, and tell the kitchen to avoid the same problem.',
    'How do you control costs?|I check the stock every day, reduce waste, and compare supplier prices.',
    'How do you manage a very busy night?|I plan the staff in advance, assign each person a clear area, and stay on the floor to help.',
    'How do you keep the team motivated?|I thank them for good work, give fair schedules, and listen to their ideas.',
    'How do you make sure the restaurant is clean and safe?|I use a daily checklist and I check the kitchen and the dining room before we open.',
  ],
  [
    'مترجم', 'a translator', 'translation', 'accuracy',
    'Which languages do you work with?|I translate between Arabic and English, and I can read French.',
    'How do you deal with a word you do not know?|I check dictionaries, search for examples in context, and ask an expert when needed.',
    'How do you keep the meaning and the style?|I read the whole text first, then I translate the ideas and not only the words.',
    'How do you manage long documents with a short deadline?|I divide the work into parts, set times for each part, and keep a few hours for review.',
    'What tools do you use?|I use translation software and a glossary, but I always review the result myself.',
    'How do you keep client information private?|I sign a confidentiality agreement and I never share files with anyone else.',
  ],
  [
    'مشرف سلامة', 'a safety officer', 'health and safety', 'responsibility',
    'What are the main safety risks on a work site?|Falls, moving machines, electricity, and not wearing protective equipment.',
    'How do you train workers about safety?|I use short talks, simple pictures, and practice, and I check that everyone understands.',
    'What do you do after an accident?|I help the injured person, make the area safe, report the accident, and find the cause.',
    'How do you make workers follow the rules?|I explain the reason, lead by example, and talk to people who break the rules.',
    'How often do you inspect the site?|I inspect every day, and I make a full report every week.',
    'How do you prepare for an emergency?|I make an evacuation plan, practise it every few months, and check the fire equipment.',
  ],
  [
    'محلل بيانات', 'a data analyst', 'data analysis', 'problem solving',
    'Which tools do you use for data analysis?|I use Excel and SQL for analysis and Power BI for charts.',
    'How do you clean messy data?|I remove duplicates, fix missing values, and check that the numbers make sense.',
    'How do you explain results to a manager?|I start with the main finding, show one simple chart, and suggest what to do next.',
    'Tell me about an analysis that helped a business.|I found that most customers left after the second month, so the company improved its follow-up and kept more clients.',
    'How do you know your analysis is correct?|I compare it with another source and I ask a colleague to review my method.',
    'How do you choose the right chart?|I think about the question first. A line shows change over time and a bar compares groups.',
  ],
];


const _jobs2 = <List<String>>[
  [
    'سائق توصيل', 'a delivery driver', 'delivery', 'time management',
    'How do you plan your delivery route?|I check all the addresses first, group the nearby ones, and use the map to avoid traffic.',
    'What do you do if a customer is not at home?|I call the customer, wait a few minutes, and then follow the company rules before I leave a message.',
    'How do you handle a late delivery?|I inform the customer early, apologise, and give a clear new time.',
    'How do you keep the packages safe?|I check each package before I load it and I drive carefully.',
    'What would you do if your vehicle broke down?|I would stop safely, call my supervisor, and ask for another vehicle so the orders are not delayed.',
    'Why are you good for this job?|I know the city well, I am punctual, and I treat every customer politely.',
  ],
  [
    'كاشير', 'a cashier', 'retail', 'accuracy',
    'How do you make sure you give the right change?|I count the money twice and I say the amount aloud to the customer.',
    'What do you do if the system stops working?|I stay calm, tell the customers, and call my supervisor while I keep the line moving.',
    'How do you deal with a long queue?|I work quickly but carefully, and I greet every customer with a smile.',
    'A customer says the price is wrong. What do you do?|I check the price tag and the system, apologise, and ask my supervisor if it is a mistake.',
    'How do you handle an angry customer?|I listen without interrupting, apologise, and look for a quick solution.',
    'Why do you want to work here?|I enjoy helping people, and I want to grow with a professional team.',
  ],
  [
    'فني كهرباء', 'an electrician', 'electrical work', 'safety',
    'What safety steps do you follow?|I switch off the power, test the wires, and wear protective equipment before I start.',
    'How do you find the cause of a power problem?|I check the main breaker, then test each circuit step by step until I find the fault.',
    'Have you worked on a large installation?|Yes. I worked on wiring for a small building, and we finished it on time without accidents.',
    'How do you read a wiring diagram?|I follow the symbols and the numbers, and I check each connection against the plan.',
    'What would you do if a customer asks for something unsafe?|I would explain the risk politely and suggest a safe alternative.',
    'Why should we hire you?|I am careful, I follow the rules, and I always test my work before I leave.',
  ],
  [
    'صيدلاني', 'a pharmacist', 'healthcare', 'accuracy',
    'How do you check a prescription?|I read the dose and the patient details, check for allergies and interactions, and ask the doctor if anything is unclear.',
    'How do you explain medicine to a patient?|I use simple words, explain the dose and the time, and ask the patient to repeat it.',
    'What would you do if you found a mistake in a prescription?|I would not give the medicine, and I would contact the doctor at once.',
    'How do you manage the stock?|I check expiry dates every week and reorder before items run out.',
    'How do you deal with a worried patient?|I stay calm, listen carefully, and give clear and honest information.',
    'Why do you want this job?|I enjoy helping people stay healthy, and I like work that needs accuracy.',
  ],
  [
    'مصمم جرافيك', 'a graphic designer', 'design', 'creativity',
    'Which design tools do you use?|I use Photoshop, Illustrator, and Figma for posters, logos, and social media designs.',
    'How do you start a new project?|I ask about the goal and the audience, collect examples, and then draw a few quick ideas.',
    'How do you handle feedback you disagree with?|I listen, explain my idea, and then try a version that solves the client\'s concern.',
    'How do you meet a tight deadline?|I plan my steps, finish the main design first, and leave small details for the end.',
    'Can you describe a project you are proud of?|I designed a brand identity for a small cafe, and their sales grew by twenty percent.',
    'How do you stay creative?|I follow other designers, visit exhibitions, and test new styles every week.',
  ],
  [
    'موارد بشرية', 'an HR officer', 'human resources', 'communication',
    'How do you screen job applicants?|I check the CV against the job needs, call the best candidates, and prepare clear interview questions.',
    'How do you handle a conflict between employees?|I listen to both sides separately, stay neutral, and help them find a fair solution.',
    'How do you keep employee information private?|I keep files locked, share information only with approved people, and follow company policy.',
    'What makes a good onboarding?|A clear plan for the first week, a friendly welcome, and a person who can answer questions.',
    'How do you deliver bad news to an employee?|I am honest and respectful, I explain the reasons, and I offer support.',
    'Why do you want to work in HR?|I enjoy working with people and helping both employees and the company succeed.',
  ],
  [
    'مشرف مستودع', 'a warehouse supervisor', 'logistics', 'organisation',
    'How do you organise a warehouse?|I group items by type and speed of sale, label every shelf, and keep the paths clear.',
    'How do you avoid mistakes in orders?|I scan every item, check the quantity twice, and review the list before shipping.',
    'How do you keep the team safe?|I give safety training, check equipment, and make sure everyone wears protective gear.',
    'What would you do if an order arrives damaged?|I take photos, record it, and contact the supplier to replace the goods.',
    'How do you manage a busy season?|I plan the shifts early, add temporary staff, and review the work every day.',
    'Why are you right for this position?|I have experience with inventory systems, and I keep my team focused and safe.',
  ],
  [
    'مضيف طيران', 'a flight attendant', 'aviation', 'customer service',
    'Why do you want to be a flight attendant?|I love meeting people from different cultures, and I enjoy helping passengers feel safe and comfortable.',
    'How do you handle a nervous passenger?|I speak calmly, explain what is happening, and stay with them until they feel better.',
    'What would you do in an emergency?|I would stay calm, follow the safety procedures, and give clear instructions.',
    'How do you work with a team in a small space?|I communicate clearly, help others, and respect everyone\'s role.',
    'How do you deal with a rude passenger?|I stay polite, listen, and if needed I ask a senior crew member to help.',
    'What languages do you speak?|I speak Arabic and English, and I am happy to learn more.',
  ],
  [
    'مدرب لياقة', 'a fitness trainer', 'fitness', 'motivation',
    'How do you create a plan for a new client?|I ask about the goal and health, test their level, and build a plan step by step.',
    'How do you motivate a client who wants to quit?|I remind them of their progress, set smaller goals, and celebrate every small success.',
    'How do you keep clients safe?|I teach the correct form, start slowly, and stop if they feel pain.',
    'What would you say to a beginner?|Start slowly, be regular, and do not compare yourself with others.',
    'How do you stay up to date?|I read research, attend courses, and try new methods on myself first.',
    'Why should the gym hire you?|I am energetic, I care about results, and I make training enjoyable and safe.',
  ],
  [
    'مصور', 'a photographer', 'photography', 'creativity',
    'What kind of photography do you do?|I do portraits and events, and I like natural light.',
    'How do you prepare for a shoot?|I visit the place, check the light, and prepare my equipment and a shot list.',
    'How do you make people comfortable in front of the camera?|I talk with them, make jokes, and show them the photos as we go.',
    'Which editing software do you use?|I use Lightroom for colours and Photoshop for small fixes.',
    'How do you handle a client who is not happy with the photos?|I listen, ask what they want, and edit again or take new photos if needed.',
    'Why should we choose you?|I am reliable, I deliver on time, and my photos tell a story.',
  ],
  [
    'موظف أمن', 'a security officer', 'security', 'alertness',
    'What are the main duties of a security officer?|To protect people and property, watch the area, and report anything unusual.',
    'How do you stay alert during a long shift?|I walk regularly, drink water, and keep my attention on the cameras and the area.',
    'What would you do if you saw a suspicious person?|I would watch calmly, report to my supervisor, and not take risks alone.',
    'How do you deal with an angry visitor?|I stay calm, speak politely, and explain the rules clearly.',
    'What would you do in a fire alarm?|I would help people leave safely, call the emergency number, and guide the fire team.',
    'Why do you want this job?|I am responsible and disciplined, and I want to help keep people safe.',
  ],
  [
    'معلم لغة', 'a language teacher', 'education', 'patience',
    'How do you plan a lesson?|I set a clear goal, choose a warm-up activity, practise the new language, and finish with a short review.',
    'How do you teach a shy student?|I give small tasks first, praise every effort, and let the student speak in pairs.',
    'How do you correct mistakes?|I correct kindly, give the right form, and let the student try again.',
    'How do you keep students interested?|I use games, real situations, and short activities.',
    'How do you measure progress?|I use short tests, speaking tasks, and a simple record of each student\'s goals.',
    'Why do you love teaching?|I enjoy seeing students gain confidence and use the language in real life.',
  ],
];

final List<List<String>> _allJobs = [..._jobs, ..._jobs2];

/// أسماء الوظائف بالعربية.
List<String> proJobTitles() => [for (final j in _allJobs) j[0]];

/// أسئلة وأجوبة عامة بعد تعويض بيانات الوظيفة.
List<List<String>> proGeneralQA(int job) {
  final j = _allJobs[job % _allJobs.length];
  String f(String t) => t.replaceAll('{0}', j[1]).replaceAll('{1}', j[2]).replaceAll('{2}', j[3]);
  return [
    for (final g in _general)
      [f(g.split('|')[0]), f(g.split('|')[1])],
  ];
}

/// أسئلة خاصة بالوظيفة نفسها.
List<List<String>> proJobQA(int job) {
  final j = _allJobs[job % _allJobs.length];
  return [
    for (var i = 4; i < j.length; i++) [j[i].split('|')[0], j[i].split('|')[1]],
  ];
}

/// بيانات الوظيفة للقوالب الأساسية: [المسمى، المجال، الميزة].
List<String> proJobSlots(int job) {
  final j = _allJobs[job % _allJobs.length];
  return [j[1], j[2], j[3]];
}

int proQuestionCount() => _allJobs.length * (_general.length + 6 + 20);
