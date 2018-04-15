export class CustomerPersonValueConverter {
    toView(value) {
      if(value) {
          return value;
      }
      return 'Nav norādīta kontaktpersona';
    }
  }  