import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@common/shared/shared.module';

import { ResultService } from '../services/result.service';
import { ResultRoutingModule } from './result-routing.module';
import { ResultComponent } from './result.component';
import { ReviewConditionComponent } from '../dialog/query-builder/review-condition/review-condition.component';
import { QbResultComponent } from './qb-result/qb-result.component';
import { QueryResultComponent } from './query-result/query-result.component';
import { QueryCompareComponent } from '@dialog/query-compare/query-compare.component';
import { ResultGridComponent } from './result-grid/result-grid.component';
import { ReviewQueryComponent } from '@dialog/review-query/review-query.component';
import { QueryBuilderComponent } from '@dialog/query-builder/query-builder.component';

@NgModule({
  declarations: [ResultComponent, QbResultComponent, ReviewConditionComponent, QueryResultComponent, QueryBuilderComponent, ReviewQueryComponent, ResultGridComponent, QueryCompareComponent],
  imports: [
    CommonModule,
    ResultRoutingModule,
    SharedModule
  ],
  entryComponents: [
    QueryBuilderComponent, ReviewQueryComponent, ReviewConditionComponent, QueryCompareComponent
  ],
  providers: [ResultService]
})
export class ResultModule { }
