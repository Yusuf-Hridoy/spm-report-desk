import { CardHeading } from '../components/CardHeading';
import { CheckboxGroupField } from '../components/CheckboxGroupField';
import { FieldHelpText } from '../components/FieldHelpText';
import { RadioCardGroupField } from '../components/RadioCardGroupField';
import { StepHeading } from '../components/StepHeading';
import { TextInputField } from '../components/TextInputField';
import { uiText } from '../copy/uiText';
import { DEROGATIONS, findDerogation } from '../data/derogations';
import { OTHER_PRODUCT_CATEGORY_ID, PRODUCT_CATEGORIES } from '../data/productCategories';
import { REPORTING_USES } from '../data/reportingUses';
import { SECTORS_OF_USE } from '../data/sectorsOfUse';
import { TECHNICAL_FUNCTIONS } from '../data/technicalFunctions';
import {
  allowedDerogations,
  allowedUses,
  isDerogationFixed,
  requiresSites,
  showsProductCategory,
  showsSectorOfUse,
  showsTechnicalFunction,
} from '../logic/fieldApplicabilityRules';
import { useReport } from '../state/ReportContext';
import type { UseRowChanges } from '../state/reportReducer';
import type { DerogationId, UseId, UseRow } from '../types/reportTypes';

const text = uiText.stepUses;

const PRODUCT_CATEGORY_OPTIONS = PRODUCT_CATEGORIES.map((pc) => ({
  value: pc.id,
  label: `${pc.id} ${pc.label}`,
}));
const SECTOR_OPTIONS = SECTORS_OF_USE.map((su) => ({
  value: su.id,
  label: `${su.id} ${su.label}`,
}));
const TECHNICAL_FUNCTION_OPTIONS = TECHNICAL_FUNCTIONS.map((tf) => ({
  value: tf.id,
  label: tf.label,
}));

function UseCard({ use, index }: { use: UseRow; index: number }) {
  const { state, dispatch } = useReport();
  const update = (changes: UseRowChanges) => dispatch({ type: 'UPDATE_USE', id: use.id, changes });

  const useOptions = REPORTING_USES.filter(
    (entry) => state.role !== null && allowedUses(state.role).includes(entry.id),
  ).map((entry) => ({ value: entry.id, label: entry.label, helpText: entry.helpText }));

  const derogationOptions = use.useId
    ? DEROGATIONS.filter((d) => allowedDerogations(use.useId as UseId).includes(d.id)).map((d) => ({
        value: d.id,
        label: d.label,
        helpText: d.helpText,
      }))
    : [];

  const siteOptions = state.sites.map((site) => ({
    value: site.id,
    label: [site.name, site.city].filter(Boolean).join(', '),
  }));

  return (
    <li className="card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <CardHeading>{uiText.common.useCardTitle(index)}</CardHeading>
        <button
          type="button"
          className="btn-quiet"
          onClick={() => dispatch({ type: 'REMOVE_USE', id: use.id })}
        >
          {text.removeUse}
        </button>
      </div>

      <div className="space-y-6">
        <RadioCardGroupField<UseId>
          legend={text.useLabel}
          helpText={text.useHelp}
          options={useOptions}
          value={use.useId}
          onChange={(useId) => update({ useId })}
        />

        {use.useId && (
          <>
            {isDerogationFixed(use.useId) ? (
              <div>
                <p className="field-label">{text.derogationLabel}</p>
                <p className="mt-1">
                  {use.derogationIds.map((id) => findDerogation(id).label).join('; ')}
                </p>
                <FieldHelpText id={`${use.id}-derogation-help`}>
                  {text.derogationAuto}
                </FieldHelpText>
              </div>
            ) : (
              <CheckboxGroupField
                legend={text.derogationLabel}
                helpText={text.derogationHelp}
                options={derogationOptions}
                selected={use.derogationIds}
                onChange={(ids) => update({ derogationIds: ids as DerogationId[] })}
              />
            )}

            <TextInputField
              label={text.useNameLabel}
              helpText={text.useNameHelp}
              value={use.useName}
              onChange={(useName) => update({ useName })}
            />

            {showsProductCategory(use.useId) && (
              <div className="space-y-3">
                <CheckboxGroupField
                  legend={text.productCategoryLabel}
                  helpText={text.productCategoryHelp}
                  options={PRODUCT_CATEGORY_OPTIONS}
                  selected={use.productCategoryIds}
                  onChange={(productCategoryIds) => update({ productCategoryIds })}
                />
                {use.productCategoryIds.includes(OTHER_PRODUCT_CATEGORY_ID) && (
                  <TextInputField
                    label={text.productCategoryOtherLabel}
                    value={use.productCategoryOtherText}
                    onChange={(productCategoryOtherText) => update({ productCategoryOtherText })}
                  />
                )}
              </div>
            )}

            {showsSectorOfUse(use.useId) && (
              <CheckboxGroupField
                legend={text.sectorOfUseLabel}
                helpText={text.sectorOfUseHelp}
                options={SECTOR_OPTIONS}
                selected={use.sectorOfUseIds}
                onChange={(sectorOfUseIds) => update({ sectorOfUseIds })}
              />
            )}

            {showsTechnicalFunction(use.useId) && (
              <CheckboxGroupField
                legend={text.technicalFunctionLabel}
                helpText={text.technicalFunctionHelp}
                options={TECHNICAL_FUNCTION_OPTIONS}
                selected={use.technicalFunctionIds}
                onChange={(technicalFunctionIds) => update({ technicalFunctionIds })}
              />
            )}

            {requiresSites(use.useId) &&
              (siteOptions.length > 0 ? (
                <CheckboxGroupField
                  legend={text.sitesLabel}
                  helpText={text.sitesHelp}
                  options={siteOptions}
                  selected={use.siteIds}
                  onChange={(siteIds) => update({ siteIds })}
                />
              ) : (
                <div>
                  <p className="field-label">{text.sitesLabel}</p>
                  <p className="mt-1 text-gray-700">{text.noSitesYet}</p>
                </div>
              ))}
          </>
        )}
      </div>
    </li>
  );
}

export function StepUses() {
  const { state, dispatch } = useReport();
  return (
    <section aria-labelledby="step-heading">
      <StepHeading title={text.heading} intro={text.intro} />
      {state.uses.length === 0 ? (
        <p className="mt-6 text-gray-700">{text.noUses}</p>
      ) : (
        <ul className="mt-6 space-y-6">
          {state.uses.map((use, index) => (
            <UseCard key={use.id} use={use} index={index} />
          ))}
        </ul>
      )}
      <button
        type="button"
        className="btn-secondary mt-6"
        onClick={() => dispatch({ type: 'ADD_USE', id: crypto.randomUUID() })}
      >
        {text.addUse}
      </button>
    </section>
  );
}
