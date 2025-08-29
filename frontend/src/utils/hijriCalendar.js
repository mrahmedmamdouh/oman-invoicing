import momentHijri from 'moment-hijri';

export const getHijriDate = (gregorianDate = new Date()) => {
  return momentHijri(gregorianDate);
};

export const formatHijriDate = (date, format = 'iYYYY/iM/iD') => {
  return momentHijri(date).format(format);
};

export const getHijriMonths = (language = 'ar') => {
  const arabicMonths = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];
  
  const englishMonths = [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
    'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];
  
  return language === 'ar' ? arabicMonths : englishMonths;
};

export const convertGregorianToHijri = (gregorianDate) => {
  return momentHijri(gregorianDate);
};

export const convertHijriToGregorian = (hijriDate) => {
  return momentHijri(hijriDate, 'iYYYY/iM/iD').toDate();
};

// Get current Hijri date info
export const getCurrentHijriInfo = () => {
  const now = momentHijri();
  
  return {
    date: now.format('iYYYY/iM/iD'),
    year: now.iYear(),
    month: now.iMonth() + 1, // momentHijri uses 0-based months
    day: now.iDate(),
    monthName: getHijriMonths('ar')[now.iMonth()],
    monthNameEn: getHijriMonths('en')[now.iMonth()],
  };
};
