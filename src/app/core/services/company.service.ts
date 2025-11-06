import { Injectable, signal } from '@angular/core';
import { Company } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private companySignal = signal<Company | null>(null);
  company = this.companySignal.asReadonly();

  constructor() {
    this.loadCompany();
  }

  private loadCompany() {
    const stored = localStorage.getItem('company');
    if (stored) {
      this.companySignal.set(JSON.parse(stored));
    } else {
      const mockCompany: Company = {
        id: '1',
        name: 'Mon Entreprise',
        ice: '000123456000070',
        email: 'contact@monentreprise.ma',
        phone: '+212 5 22 12 34 56',
        address: '123 Boulevard Zerktouni',
        city: 'Casablanca',
        country: 'Maroc',
        taxNumber: 'IF12345678',
        legalText: 'SARL au capital de 100.000 MAD - RC: 123456',
        website: 'www.monentreprise.ma'
      };
      this.companySignal.set(mockCompany);
      this.saveCompany();
    }
  }

  private saveCompany() {
    localStorage.setItem('company', JSON.stringify(this.companySignal()));
  }

  update(updates: Partial<Company>): Company {
    const updated = {
      ...this.companySignal()!,
      ...updates
    };
    this.companySignal.set(updated);
    this.saveCompany();
    return updated;
  }
}
