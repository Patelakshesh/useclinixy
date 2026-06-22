const fs = require('fs');

let f1 = 'src/controllers/public.controller.ts';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(/req\.params\.clinicId/g, '(req.params.clinicId as string)');
fs.writeFileSync(f1, c1);

let f2 = 'src/controllers/subscription.controller.ts';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(/clinic\.createdAt/g, '((clinic as any).createdAt)');
fs.writeFileSync(f2, c2);

let f3 = 'src/middlewares/validate.middleware.ts';
let c3 = fs.readFileSync(f3, 'utf8');
c3 = c3.replace(/AnyZodObject/g, 'ZodObject<any>');
c3 = c3.replace(/e\.errors/g, '(e as any).errors');
fs.writeFileSync(f3, c3);

let f4 = 'src/utils/auditLog.util.ts';
let c4 = fs.readFileSync(f4, 'utf8');
c4 = c4.replace(/userId: userId,/g, 'userId: userId || undefined,');
fs.writeFileSync(f4, c4);

let f5 = 'src/utils/jwt.util.ts';
let c5 = fs.readFileSync(f5, 'utf8');
c5 = c5.replace(/process\.env\.JWT_SECRET/g, '(process.env.JWT_SECRET as string)');
c5 = c5.replace(/process\.env\.JWT_EXPIRES_IN/g, '(process.env.JWT_EXPIRES_IN as string)');
fs.writeFileSync(f5, c5);

let f6 = 'src/utils/seed.ts';
let c6 = fs.readFileSync(f6, 'utf8');
c6 = c6.replace(/gender: 'MALE',/g, 'gender: "MALE" as any,');
c6 = c6.replace(/patients\[Math\.floor\(Math\.random\(\) \* patients\.length\)\]\._id/g, '(patients[Math.floor(Math.random() * patients.length)] as any)._id');
fs.writeFileSync(f6, c6);

console.log('Fixed more errors');
