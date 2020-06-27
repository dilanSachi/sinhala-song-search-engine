import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  @Output() resultEvent: EventEmitter<any> = new EventEmitter();

  query: string;

  constructor(private searchService: SearchService) { }

  ngOnInit() {
  }

  search() {
    this.searchService.search(this.query).subscribe(result => {
      this.resultEvent.emit(result);
    });
  }

}
