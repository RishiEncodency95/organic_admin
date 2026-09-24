import { FEATURED_IMAGE } from "../constants";
import { FieldLabel, SelectField, TextInput, Toggle } from "../fields";
import { SectionTitle } from "../section-editor";
import type { FormState, Status } from "../types";

export function PageSettingsPanel({
  form,
  updateField,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <section
      className="
        shrink-0
        border
        border-[#dedfdb]
        shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
        bg-white
        px-[16px]
        py-[10px]
      "
    >
      <SectionTitle
        number={4}
        title="Page Settings"
      />

      <div
        className="
          mt-[9px]
          grid
          grid-cols-[.82fr_.82fr_1.4fr]
          gap-x-[24px]
        "
      >
        <div>
          <FieldLabel>
            Page Status
          </FieldLabel>

          <SelectField
            value={
              form.status
            }
            onChange={(
              value,
            ) =>
              updateField(
                "status",
                value as Status,
              )
            }
            options={[
              "Published",
              "Draft",
            ]}
          />
        </div>

        <div>
          <FieldLabel required>
            Author
          </FieldLabel>

          <SelectField
            value={
              form.author
            }
            onChange={(
              value,
            ) =>
              updateField(
                "author",
                value,
              )
            }
            options={[
              "Admin User",
              "Seva Team",
            ]}
          />
        </div>

        {/* FEATURED IMAGE */}

        <div className="row-span-2">
          <FieldLabel>
            Featured Image
          </FieldLabel>

          <div
            className="
              flex
              h-[76px]
              items-center
              gap-[11px]
              rounded-[6px]
              border
              border-[#dedfdb]
              bg-white
              p-[7px]
            "
          >
            <div
              className="
                flex
                h-[60px]
                w-[120px]
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-[5px]
                bg-[#faf8f3]
              "
            >
              {FEATURED_IMAGE ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={FEATURED_IMAGE}
                  alt="Featured"
                  className="
                    h-full
                    w-full
                    object-contain
                    object-center
                  "
                />
              ) : (
                <span className="text-[8.5px] font-medium text-[#b3b8c2]">No image</span>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold text-[#3f4c60]">
                featured-home.jpg
              </p>

              <p className="mt-[1px] text-[8.5px] font-medium text-[#808894]">
                1200x630px
              </p>

              <div className="mt-[5px] flex items-center gap-[10px]">
                <button
                  type="button"
                  className="text-[8.5px] font-semibold text-[#2d8653]"
                >
                  Change Image
                </button>

                <button
                  type="button"
                  className="text-[8.5px] font-semibold text-[#d25a52]"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[9px]">
          <FieldLabel>
            Show in Navigation Menu
          </FieldLabel>

          <div className="flex items-start gap-[9px]">
            <Toggle
              checked={
                form.showInNavigation
              }
              onChange={(
                value,
              ) =>
                updateField(
                  "showInNavigation",
                  value,
                )
              }
            />

            <span className="max-w-[155px] text-[8.5px] font-medium leading-[11px] text-[#858c98]">
              Show this page in
              main navigation
              menu
            </span>
          </div>
        </div>

        <div className="mt-[9px]">
          <FieldLabel>
            Menu Order
          </FieldLabel>

          <TextInput
            value={
              form.menuOrder
            }
            onChange={(
              value,
            ) =>
              updateField(
                "menuOrder",
                value,
              )
            }
          />

          <p className="mt-[2px] text-[8.5px] font-medium leading-[11px] text-[#858c98]">
            Set display order in
            navigation menu.
          </p>
        </div>
      </div>
    </section>
  );
}
